// LE PARCOURS DU CONTRAT — QUATRE ÉCRANS
// ======================================
//
// ┌─────────────────────────────────────────────────────────────────────────┐
// │ 🚨 CET ÉCRAN N'EXISTE QUE POUR LA LOCATION, ET SEULEMENT SI LE LOUEUR   │
// │ A ALLUMÉ « Contrat en ligne ». Éteint, le bouton part sur la messagerie │
// │ comme avant, et ce fichier n'est jamais appelé.                         │
// └─────────────────────────────────────────────────────────────────────────┘
//
// Consigne N°25, partie 2 : « Après avoir choisi ses dates, le bouton de
// réservation ouvre un parcours en 4 étapes avec une barre de progression. »
//
//   1. ses informations    2. les conditions
//   3. la signature        4. c'est envoyé
//
// ⚠️ LES RÈGLES NE SONT PAS ICI. Ce qui manque, l'âge, le permis, les cases à
// accepter : tout ça vit dans location-contrat.js, qui n'importe rien et
// s'éprouve avec node. Ici, il n'y a que le dessin et les gestes — c'est ce
// qui permet de vérifier les règles sans ouvrir un navigateur.

import React, { useState, useRef, useEffect, useMemo } from "react";
import { Check, ChevronLeft, MessageCircle, FileText } from "lucide-react";
import {
  TITRE, CORPS, CARTE, VOILE, fondCarte, bordure, texte, texteDoux,
  vert, jaune, cyan, DEGRADE, BOUTIQUE, MESSAGERIE, CONTACT, PEUT_COMMANDER,
  vibrer, ouvrirDehors, copierAvantDePartir,
} from "./commun.jsx";
import { eurosLocation } from "./location-prix.js";
import { sectionsDesConditions } from "./location-infos.js";
import {
  CHAMPS_DU_CLIENT, ceQuiManque, ceQuiBloque, casesAAccepter,
  signerLeContrat, fabriquerLePdf, phraseDeRefusDuContrat,
  relireSesInfos, garderSesInfos, oublierSesInfos,
} from "./location-contrat.js";

const ETAPES = ["Vos informations", "Les conditions", "La signature", "C'est envoyé"];

/* Le message qui part sur la messagerie une fois le contrat signé. Il porte
   le numéro : c'est ce que le loueur retrouvera dans sa page « Contrats ». */
const motDApresSignature = (numero, v, periode) =>
  "Bonjour, je viens de signer le contrat n° " + (numero || "—")
  + " pour " + ((v && v.nom) || "un véhicule")
  + (periode ? " — " + periode : "") + ".";

/* 🚨 UN SEUL ENDROIT OÙ CE FICHIER FABRIQUE UNE ADRESSE DE MESSAGERIE.
   La règle du projet : le numéro du vendeur ne se fabrique qu'aux endroits
   voulus, jamais sur une vitrine — c'est ce qu'avait oublié l'onglet Avis, qui
   livrait le numéro d'une boutique d'exemple. La fabrication compte ces
   endroits et refuse d'en voir un de plus (outils/fabriquer.js). */
function lienApresSignature(numero, v, periode) {
  return MESSAGERIE.lien(CONTACT, motDApresSignature(numero, v, periode));
}

/* L'identifiant d'un champ dans la page. Il sert à emmener le client au
   premier qui manque — et rien d'autre. */
const idDuChamp = (cle) => "contrat-" + cle;

function allerAuChamp(cle) {
  try {
    const el = document.getElementById(idDuChamp(cle));
    if (!el) return;
    el.scrollIntoView({ block: "center" });
    el.focus({ preventScroll: true });
  } catch (e) { /* un navigateur ancien : tant pis, la phrase reste */ }
}

const aujourdhuiEnJour = () => {
  const d = new Date();
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0")
    + "-" + String(d.getDate()).padStart(2, "0");
};

/* ═══════════ LA SIGNATURE AU DOIGT ═══════════

   🚨 UN CANEVAS QUI NE SUIT PAS LE DOIGT NE SE SIGNE PAS.
   Deux pièges, et les deux se voient tout de suite sur un téléphone :
   le canevas doit être dimensionné en pixels RÉELS (sans quoi le trait se
   décale de la moitié de l'écran), et le glissement doit empêcher la page de
   défiler sous le doigt (« touchAction: none »). */
function Signature({ nom, surSignature }) {
  const toile = useRef(null);
  const dessine = useRef(false);
  const [vide, setVide] = useState(true);

  useEffect(() => {
    const c = toile.current;
    if (!c) return;
    const ratio = window.devicePixelRatio || 1;
    const large = c.offsetWidth;
    const haut = c.offsetHeight;
    c.width = large * ratio;
    c.height = haut * ratio;
    const ctx = c.getContext("2d");
    ctx.scale(ratio, ratio);
    ctx.lineWidth = 2.2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#FFFFFF";
  }, []);

  const ou = (e) => {
    const c = toile.current;
    const r = c.getBoundingClientRect();
    const p = e.touches ? e.touches[0] : e;
    return { x: p.clientX - r.left, y: p.clientY - r.top };
  };

  const commencer = (e) => {
    e.preventDefault();
    const ctx = toile.current.getContext("2d");
    const { x, y } = ou(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    dessine.current = true;
  };

  const tracer = (e) => {
    if (!dessine.current) return;
    e.preventDefault();
    const ctx = toile.current.getContext("2d");
    const { x, y } = ou(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    if (vide) setVide(false);
  };

  const arreter = () => {
    if (!dessine.current) return;
    dessine.current = false;
    try { surSignature(toile.current.toDataURL("image/png")); } catch (e) { /* rien */ }
  };

  const effacer = () => {
    const c = toile.current;
    const ctx = c.getContext("2d");
    ctx.clearRect(0, 0, c.width, c.height);
    setVide(true);
    surSignature("");
    vibrer("leger");
  };

  return (
    <div>
      <div style={{ position: "relative" }}>
        <canvas
          ref={toile}
          className="w-full rounded-2xl"
          style={{
            height: 170, touchAction: "none", display: "block",
            background: VOILE(fondCarte, "D9"),
            border: `1px dashed ${vide ? bordure : vert}`,
          }}
          onMouseDown={commencer} onMouseMove={tracer} onMouseUp={arreter} onMouseLeave={arreter}
          onTouchStart={commencer} onTouchMove={tracer} onTouchEnd={arreter}
        />
        {/* L'invite se pose PAR-DESSUS la toile, sans la pousser : une marge
            négative la ferait glisser dès que la hauteur change. Et elle
            laisse passer le doigt — sinon le premier trait se perd. */}
        {vide && (
          <p
            className="text-center"
            style={{
              position: "absolute", left: 0, right: 0, top: 74,
              fontFamily: CORPS, fontSize: 12.5, color: texteDoux, pointerEvents: "none",
            }}
          >
            Signez ici avec le doigt
          </p>
        )}
      </div>
      <div className="flex items-center justify-between gap-3" style={{ marginTop: 10 }}>
        <p style={{ fontFamily: CORPS, fontSize: 12, color: texteDoux }}>
          Lu et approuvé · <b style={{ color: texte }}>{nom || "votre nom"}</b>
        </p>
        <button
          onClick={effacer}
          className="px-3 py-2 rounded-xl"
          style={{ background: VOILE(fondCarte, "D9"), border: `1px solid ${bordure}`, fontFamily: CORPS, fontSize: 12.5, color: texteDoux }}
        >
          Effacer
        </button>
      </div>
    </div>
  );
}

/* ═══════════ LE PARCOURS ═══════════ */
export function ParcoursDuContrat({ v, du, au, jours, compte, heures, reglages, periode, onFermer, onSigne }) {
  const [etape, setEtape] = useState(0);
  const [client, setClient] = useState(() => relireSesInfos());
  const [cochees, setCochees] = useState([]);
  const [signature, setSignature] = useState("");
  const [article, setArticle] = useState(-1);
  /* 🚨 UN FORMULAIRE NE DOIT PAS ACCUEILLIR LE CLIENT EN ROUGE.
     Neuf champs encadrés de jaune à l'arrivée, alors qu'il n'a rien tapé
     encore : c'est une page qui le gronde avant qu'il commence. On ne montre
     ce qui manque qu'après son premier appui sur « Continuer ». */
  const [insiste, setInsiste] = useState(false);
  const [envoi, setEnvoi] = useState(false);
  const [refus, setRefus] = useState("");
  const [numero, setNumero] = useState("");
  /* Le lien vers son PDF. Vide tant que le document n'est pas fabriqué :
     quelques secondes après la signature, le bouton apparaît. */
  const [lienPdf, setLienPdf] = useState("");

  const sections = useMemo(() => sectionsDesConditions(reglages.conditions), [reglages]);
  const cases = useMemo(() => casesAAccepter(reglages, BOUTIQUE.nom), [reglages]);
  const manques = ceQuiManque(client);
  const blocages = ceQuiBloque(client, reglages, aujourdhuiEnJour());

  const ecrire = (cle, valeur) => setClient((c) => ({ ...c, [cle]: valeur }));

  /* On garde ses informations à chaque étape franchie, pas à chaque lettre
     tapée : écrire dans le téléphone à chaque frappe ralentit la saisie. */
  const avancer = () => {
    if (etape === 0) {
      if (manques.length) {
        setInsiste(true);
        vibrer("leger");
        /* 🚨 ON L'EMMÈNE AU CHAMP, ON NE LUI DIT PAS DE LE CHERCHER.
           Le bouton est en bas de neuf champs : « il reste à remplir… » lu
           là, c'est une remontée à l'aveugle. */
        allerAuChamp(manques[0].cle);
        return;
      }
      garderSesInfos(client);
    }
    if (etape === 1 && (cochees.length < cases.length || blocages.length)) { vibrer("leger"); return; }
    if (etape === 2) { envoyer(); return; }
    setEtape((n) => Math.min(n + 1, ETAPES.length - 1));
  };

  const envoyer = async () => {
    if (!signature || envoi) return;
    setEnvoi(true);
    setRefus("");
    const r = await signerLeContrat({
      boutique_: window.location.origin,
      vehicule_: v.ref || v.nom,
      vehicule_nom_: v.nom,
      du_: du,
      au_: au,
      heures_: heures || "",
      client_: client,
      conducteur_: null,
      conditions_: String(reglages.conditions || ""),
      signature_: signature,
      total_: compte && compte.calculable ? compte.total : 0,
      caution_: Number(v.caution) || 0,
      options_: compte && compte.options ? compte.options.lignes.map((o) => o.nom) : [],
    });
    setEnvoi(false);
    if (!r.ok) { setRefus(phraseDeRefusDuContrat(r.pourquoi)); return; }
    setNumero(r.numero);
    setEtape(3);
    /* Le PDF et les deux mails partent derrière, sans qu'on les attende :
       voir « fabriquerLePdf ». Le contrat, lui, est déjà enregistré. Quand
       le document est prêt, le bouton pour l'ouvrir apparaît tout seul. */
    fabriquerLePdf(r.id).then((lien) => { if (lien) setLienPdf(lien); });
    if (onSigne) onSigne();
  };

  const champ = (c) => {
    /* ⚠️ UN SEUL CHAMP SOULIGNÉ À LA FOIS — LE PREMIER QUI MANQUE.
       Neuf cadres allumés d'un coup, et l'œil ne sait plus où aller : ça ne
       dit plus « il manque ça », ça dit « tout est faux ». Mesuré à 375 px le
       22 octobre 2026 : les neuf champs s'allumaient ensemble. */
    const faux = insiste && manques.length > 0 && manques[0].cle === c.cle;
    const bloque = blocages.find((b) => b.cle === c.cle);
    return (
      <label key={c.cle} className="block mb-2">
        <span style={{ fontFamily: CORPS, fontSize: 11.5, color: texteDoux }}>{c.nom}</span>
        <input
          id={idDuChamp(c.cle)}
          type={c.genre === "date" ? "date" : c.genre === "email" ? "email" : c.genre === "tel" ? "tel" : "text"}
          value={client[c.cle] || ""}
          onChange={(e) => ecrire(c.cle, e.target.value)}
          placeholder={c.exemple || ""}
          className="w-full mt-1 px-3 py-2.5 rounded-xl"
          style={{
            background: VOILE(fondCarte, "D9"),
            border: `1px solid ${bloque || faux ? jaune : bordure}`,
            color: texte, fontFamily: CORPS, fontSize: 13.5,
          }}
        />
        {c.pourquoi && (
          <span style={{ fontFamily: CORPS, fontSize: 11, color: texteDoux }}>{c.pourquoi}</span>
        )}
        {bloque && (
          <span className="block mt-1" style={{ fontFamily: CORPS, fontSize: 12, color: jaune, lineHeight: 1.5 }}>
            {bloque.dit}
          </span>
        )}
      </label>
    );
  };

  return (
    <div className="px-3 pb-6">
      {/* La barre de progression, et le retour.
          ⚠️ PAS DE FLÈCHE À LA PREMIÈRE ÉTAPE : la barre du haut en a déjà
          une, et elle ferme le parcours. Deux flèches côte à côte qui font la
          même chose, c'est une hésitation de plus avant de remplir. */}
      <div className="flex items-center gap-2 pt-3 pb-2">
        {etape > 0 && etape < 3 && (
          <button
            onClick={() => setEtape((n) => n - 1)}
            aria-label="Revenir à l'étape précédente"
            className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: CARTE, border: `1px solid ${bordure}` }}
          >
            <ChevronLeft size={18} color={texteDoux} />
          </button>
        )}
        <div className="flex-1 flex gap-1.5">
          {ETAPES.map((e, i) => (
            <span key={e} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= etape ? cyan : bordure }} />
          ))}
        </div>
      </div>

      <p style={{ fontFamily: TITRE, fontSize: 20, color: texte, letterSpacing: ".3px" }}>
        {ETAPES[etape]}
      </p>
      <p className="mb-3" style={{ fontFamily: CORPS, fontSize: 11.5, color: texteDoux }}>
        Étape {etape + 1} sur {ETAPES.length}
      </p>

      {/* Le rappel : quel véhicule, quelles dates, quel prix. */}
      {etape < 3 && (
        <div className="rounded-2xl p-3 mb-3" style={{ background: CARTE, border: `1px solid ${bordure}` }}>
          <div className="flex justify-between gap-3" style={{ fontFamily: CORPS, fontSize: 12.5 }}>
            <span style={{ color: texteDoux }}>{v.nom}</span>
            <b style={{ color: texte, fontWeight: 500 }}>{periode}</b>
          </div>
          <div className="flex justify-between gap-3 mt-1" style={{ fontFamily: CORPS, fontSize: 12.5 }}>
            <span style={{ color: texteDoux }}>
              {jours} jour{jours > 1 ? "s" : ""}
              {Number(v.caution) > 0 ? " · caution " + eurosLocation(v.caution) : ""}
            </span>
            {compte && compte.calculable && (
              <b style={{ color: cyan, fontWeight: 500 }}>{eurosLocation(compte.total)}</b>
            )}
          </div>
        </div>
      )}

      {/* ─────────── ÉCRAN 1 : SES INFORMATIONS ─────────── */}
      {etape === 0 && (
        <>
          {CHAMPS_DU_CLIENT.map(champ)}
          <p className="mt-2" style={{ fontFamily: CORPS, fontSize: 11.5, color: texteDoux, lineHeight: 1.55 }}>
            Vous montrerez vos vrais papiers en récupérant le véhicule : pièce
            d'identité, permis, justificatif de domicile et carte bancaire.
            <b style={{ color: texte }}> Aucune photo n'est envoyée ici.</b>
          </p>
          <p className="mt-2" style={{ fontFamily: CORPS, fontSize: 11, color: texteDoux, lineHeight: 1.5 }}>
            Vos informations servent uniquement à établir votre contrat de
            location avec {BOUTIQUE.nom}.
          </p>
        </>
      )}

      {/* ─────────── ÉCRAN 2 : LES CONDITIONS ─────────── */}
      {etape === 1 && (
        <>
          {sections.length > 0 && (
            <div className="flex flex-col gap-1.5 mb-3">
              {sections.map((s, i) => (
                <div key={s.titre + i} className="rounded-xl overflow-hidden" style={{ background: CARTE, border: `1px solid ${bordure}` }}>
                  <button
                    onClick={() => setArticle((n) => (n === i ? -1 : i))}
                    className="w-full px-3 py-2.5 flex items-center justify-between gap-2 text-left"
                    aria-expanded={article === i}
                  >
                    <span style={{ fontFamily: CORPS, fontSize: 12.5, color: texte, fontWeight: 600 }}>
                      {s.titre || "Préambule"}
                    </span>
                    <span style={{ fontFamily: CORPS, fontSize: 15, color: texteDoux, lineHeight: 1 }}>
                      {article === i ? "−" : "+"}
                    </span>
                  </button>
                  {article === i && (
                    <p className="px-3 pb-3" style={{ fontFamily: CORPS, fontSize: 12, color: texteDoux, lineHeight: 1.6, whiteSpace: "pre-line" }}>
                      {s.texte}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-col gap-2">
            {cases.map((c) => {
              const prise = cochees.includes(c.id);
              return (
                <button
                  key={c.id}
                  onClick={() => {
                    vibrer("leger");
                    setCochees((l) => (l.includes(c.id) ? l.filter((x) => x !== c.id) : l.concat([c.id])));
                  }}
                  aria-pressed={prise}
                  className="w-full px-3 py-3 rounded-xl flex items-center gap-3 text-left active:scale-[0.99] transition-transform"
                  style={{ background: prise ? vert + "1F" : VOILE(fondCarte, "D9"), border: `1px solid ${prise ? vert : bordure}` }}
                >
                  <span style={{ fontFamily: CORPS, fontSize: 15, color: prise ? vert : texteDoux, lineHeight: 1 }}>
                    {prise ? "☑" : "☐"}
                  </span>
                  <span style={{ fontFamily: CORPS, fontSize: 12.5, color: texte, lineHeight: 1.45 }}>{c.dit}</span>
                </button>
              );
            })}
          </div>

          {blocages.length > 0 && (
            <div className="mt-3 rounded-xl p-3" style={{ background: VOILE(fondCarte, "D9"), border: `1px solid ${jaune}` }}>
              {blocages.map((b) => (
                <p key={b.cle} style={{ fontFamily: CORPS, fontSize: 12.5, color: jaune, lineHeight: 1.55 }}>{b.dit}</p>
              ))}
            </div>
          )}

          {Number(v.caution) > 0 && (
            <p className="mt-3" style={{ fontFamily: CORPS, fontSize: 12, color: texteDoux, lineHeight: 1.55 }}>
              Dépôt de garantie : <b style={{ color: texte }}>{eurosLocation(v.caution)}</b> à prévoir
              en plus, restitué au retour du véhicule.
            </p>
          )}
        </>
      )}

      {/* ─────────── ÉCRAN 3 : LA SIGNATURE ─────────── */}
      {etape === 2 && (
        <>
          <Signature nom={client.nom} surSignature={setSignature} />
          <p className="mt-3" style={{ fontFamily: CORPS, fontSize: 11.5, color: texteDoux, lineHeight: 1.55 }}>
            En signant, vous acceptez le contrat de location et les conditions
            de {BOUTIQUE.nom}. Votre signature, la date et l'heure sont
            enregistrées comme preuve.
          </p>
          {refus && (
            <p className="mt-3 rounded-xl p-3" style={{ background: VOILE(fondCarte, "D9"), border: `1px solid ${jaune}`, fontFamily: CORPS, fontSize: 12.5, color: jaune, lineHeight: 1.55 }}>
              {refus}
            </p>
          )}
        </>
      )}

      {/* ─────────── ÉCRAN 4 : C'EST ENVOYÉ ─────────── */}
      {etape === 3 && (
        <div className="text-center pt-2">
          <div className="mx-auto flex items-center justify-center" style={{ width: 54, height: 54, borderRadius: 27, background: VOILE(fondCarte, "D9"), border: `1px solid ${vert}` }}>
            <Check size={26} color={vert} />
          </div>
          <p className="mt-3" style={{ fontFamily: TITRE, fontSize: 17, color: texte }}>
            Votre contrat est signé
          </p>
          <p style={{ fontFamily: CORPS, fontSize: 12.5, color: texteDoux }}>
            Contrat n° {numero || "—"}
          </p>

          <div className="mt-4 flex flex-col gap-2 text-left">
            <p className="rounded-xl p-3" style={{ background: CARTE, border: `1px solid ${bordure}`, fontFamily: CORPS, fontSize: 12.5, color: texte, lineHeight: 1.5 }}>
              📅 <b>Vos dates sont bloquées</b> pour vous. {BOUTIQUE.nom} vous confirme la suite.
            </p>
            {/* 🚨 LE DOCUMENT D'ABORD, LE COURRIER ENSUITE.
                Le PDF met quelques secondes à se fabriquer. Tant qu'il n'est
                pas prêt, on annonce le mail — et dès qu'il l'est, le bouton
                remplace l'annonce : le client n'a plus à aller chercher sa
                boîte pour avoir son contrat. */}
            {lienPdf ? (
              <a
                href={lienPdf}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => { e.preventDefault(); ouvrirDehors(lienPdf); }}
                className="rounded-xl p-3 flex items-center gap-2"
                style={{ background: CARTE, border: `1px solid ${vert}`, fontFamily: CORPS, fontSize: 12.5, color: texte }}
              >
                <FileText size={16} color={vert} /> Ouvrir mon contrat (PDF)
              </a>
            ) : (
              <p className="rounded-xl p-3" style={{ background: CARTE, border: `1px solid ${bordure}`, fontFamily: CORPS, fontSize: 12.5, color: texte, lineHeight: 1.5 }}>
                📄 Votre contrat en PDF arrive par e-mail
                {client.courriel ? <> à <b style={{ overflowWrap: "anywhere" }}>{client.courriel}</b></> : null}
                {" "}dans quelques instants. <span style={{ color: texteDoux }}>Pensez aux indésirables.</span>
              </p>
            )}
            {/* 🚨 LA CONVERSATION RESTE LA VIE DE LA BOUTIQUE.
                Le contrat est signé et les dates sont prises ; mais c'est en
                parlant au loueur que le client récupère ses clés. Le message
                est déjà écrit, avec le numéro du contrat. */}
            {PEUT_COMMANDER && (
              <a
                href={lienApresSignature(numero, v, periode)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  e.preventDefault();
                  if (!MESSAGERIE.prerempli) copierAvantDePartir(motDApresSignature(numero, v, periode));
                  ouvrirDehors(lienApresSignature(numero, v, periode));
                }}
                className="rounded-xl p-3 flex items-center gap-2"
                style={{ background: CARTE, border: `1px solid ${bordure}`, fontFamily: CORPS, fontSize: 12.5, color: texte }}
              >
                <MessageCircle size={16} color={cyan} /> Prévenir sur {MESSAGERIE.nom}
              </a>
            )}
            <button
              onClick={() => { oublierSesInfos(); setClient({}); vibrer("leger"); }}
              className="rounded-xl p-3 text-left"
              style={{ background: CARTE, border: `1px solid ${bordure}`, fontFamily: CORPS, fontSize: 12.5, color: texteDoux }}
            >
              🧹 Oublier mes informations sur ce téléphone
            </button>
          </div>

          <button
            onClick={onFermer}
            className="w-full mt-4 py-3 rounded-2xl"
            style={{ backgroundImage: DEGRADE, color: "#fff", fontFamily: TITRE, fontSize: 15, letterSpacing: ".5px", border: "none" }}
          >
            TERMINER
          </button>
        </div>
      )}

      {/* ─────────── LE BOUTON D'AVANCE ─────────── */}
      {etape < 3 && (
        <>
          <button
            onClick={avancer}
            disabled={envoi}
            className="w-full mt-4 py-3.5 rounded-2xl active:scale-[0.99] transition-transform"
            style={{
              backgroundImage: pret(etape, manques, cases, cochees, blocages, signature) ? DEGRADE : "none",
              backgroundColor: pret(etape, manques, cases, cochees, blocages, signature) ? "transparent" : CARTE,
              border: `1px solid ${pret(etape, manques, cases, cochees, blocages, signature) ? "transparent" : bordure}`,
              color: pret(etape, manques, cases, cochees, blocages, signature) ? "#fff" : texteDoux,
              fontFamily: TITRE, fontSize: 15, letterSpacing: ".5px",
            }}
          >
            {envoi ? "ENVOI…" : etape === 2 ? "SIGNER ET ENVOYER" : "CONTINUER"}
          </button>

          {/* 🚨 CE QUI MANQUE SE DIT, CHAMP PAR CHAMP.
              « Formulaire incomplet » sur neuf champs, c'est une chasse au
              trésor — et le client s'en va. */}
          {/* ⚠️ NEUF NOMS À LA SUITE NE SE LISENT PAS. Tant qu'il reste
              beaucoup à écrire, on compte ; quand il n'en reste que deux ou
              trois, on les nomme — c'est là que ça aide vraiment. */}
          {etape === 0 && manques.length > 0 && (
            <p className="mt-2" style={{ fontFamily: CORPS, fontSize: 11.5, color: texteDoux, lineHeight: 1.5 }}>
              {manques.length > 3
                ? "Il reste " + manques.length + " informations à remplir."
                : "Il reste à remplir : "
                  + manques.map((m) => m.dit.replace(" : à remplir", "")).join(", ") + "."}
            </p>
          )}
          {etape === 1 && cochees.length < cases.length && (
            <p className="mt-2 text-center" style={{ fontFamily: CORPS, fontSize: 11.5, color: texteDoux }}>
              Cochez les {cases.length} cases pour continuer.
            </p>
          )}
          {etape === 2 && !signature && (
            <p className="mt-2 text-center" style={{ fontFamily: CORPS, fontSize: 11.5, color: texteDoux }}>
              Votre signature manque.
            </p>
          )}
        </>
      )}
    </div>
  );
}

/* Le bouton s'allume quand l'étape est franchissable. Écrit à part : trois
   conditions dans un attribut de style, personne ne les relit. */
function pret(etape, manques, cases, cochees, blocages, signature) {
  if (etape === 0) return manques.length === 0;
  if (etape === 1) return cochees.length >= cases.length && blocages.length === 0;
  if (etape === 2) return !!signature;
  return true;
}
