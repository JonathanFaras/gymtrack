# GymTrack

Carnet de musculation **mobile-first**, pensé pour enregistrer une série en quelques secondes à la salle.

## Lancer l’app

```bash
cd gymtrack
npm install
npm run dev
```

Ouvre l’URL affichée (idéalement sur le téléphone, même Wi-Fi). Tu peux aussi installer la PWA depuis le navigateur.

## Données préchargées

- **PUSH / PULL / LEGS** (cycle actuel Basic-Fit)
- **ÉPAULES** (ancienne séance, hors cycle)
- Charges de référence et variantes (poulie haute/basse, etc.)

Les performances restent **sur l’appareil** (IndexedDB) et sont enregistrées à chaque modification. Une séance interrompue peut être reprise.

## Parcours

1. Accueil → PUSH / PULL / LEGS  
2. Démarrer → mode entraînement  
3. Poids / reps + validation ✓  
4. Timer de repos (60 / 90 / 120 / 180 s)  
5. Terminer → historique + progression par exercice  
