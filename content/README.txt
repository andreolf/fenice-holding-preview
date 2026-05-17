Modifiche senza toccare il codice del sito
==========================================

1) FOTO HERO
   - Sostituisci il file: assets/hero-lugano-funicular.png
     (stesso nome, nuova immagine in verticale consigliata)
   - Oppure cambia il percorso in: content/site.json → "heroImage"
   - Regola il ritaglio con: "heroImagePosition" (es. "center 30%")

2) TESTI IT/EN (titoli, paragrafi, pulsanti)
   - Apri option-1-editorial.html su GitHub
   - Cerca data-it= e data-en= e modifica solo il testo tra virgolette
   - Non cancellare data-it / data-en / data-it-html

3) PUBBLICARE
   - Commit su branch main → il sito si aggiorna da solo (GitHub Pages)
   - Serve accesso al repository come collaboratore

Logo sulla foto: non usare fenice-logo-white.png (ha sfondo nero).
Il marchio resta nella barra in alto. Per un logo sulla foto serve
un PNG trasparente (solo fenice rossa) — lo possiamo preparare noi.
