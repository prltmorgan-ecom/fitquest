# ⚔️ FitQuest — Ton entraînement devient un jeu vidéo

App sportive gamifiée : chaque séance d'entraînement te donne de l'**XP**. Tu commences **niveau 1** et tu grimpes jusqu'au **niveau 200** — mais ça se mérite, comptez plusieurs années d'entraînement régulier pour atteindre le rang **Légende** 👑.

## 🎮 Fonctionnalités

- **Système d'XP & niveaux 1 → 200** : courbe de progression lente et longue, comme un vrai RPG
- **10 rangs** : Bronze → Argent → Or → Platine → Diamant → Maître → Grand Maître → Champion → Mythique → Légende
- **16 skins de couleurs à débloquer** en montant de niveau (Néon, Crimson, Galaxy, Inferno… jusqu'au skin Légende au niveau 200)
- **14 programmes préconçus** inspirés des programmes les plus reconnus au monde :
  - 🏋️ **Salle** : Full Body Débutant, StrongLifts 5×5, Upper/Lower, Push Pull Legs, PHUL, Arnold Split, Aesthetic V-Taper (le physique le plus esthétique possible)
  - 🏃 **Course** : Couch to 5K, Objectif 10 km, Semi-marathon, Spécial VMA
  - 🤸 **Street workout** : Recommended Routine, Street Power lesté, Skills Calisthénie (muscle-up, front lever, handstand, planche)
- **Créateur de programme personnalisé** : choisis ton sport, tes séances, tes exercices (bibliothèque de **213 exercices** avec niveau et reps conseillées) et tes formats de séries
- **Planning hebdo sur mesure** : choisis tes jours ET la répartition par sport (ex : 4 street + 2 course + 1 repos) — l'app génère ta semaine et te dit quoi faire chaque jour, avec un programme actif par sport
- **Guide « se muscler vite »** : les 7 règles qui marchent (surcharge progressive, fourchettes de reps force/hypertrophie/endurance, fréquence, récupération…)
- **Évolutions d'exercices** : 9 progressions étape par étape (pompes → archer → une main, tractions → muscle-up, front lever, planche, handstand, pistol…)
- **Nutrition** : calcul de tes calories et macros (Mifflin-St Jeor) selon ton objectif (masse / maintien / sèche) + journées de repas types
- **Streak 🔥** : série de jours consécutifs = bonus d'XP (jusqu'à +50 %)
- **Quêtes** journalières et hebdomadaires pour de l'XP bonus
- **Suivi de progression** : historique des séances, stats, temps total d'entraînement
- **100 % hors-ligne** : tes données restent sur ton téléphone (localStorage), aucune inscription

## 🚀 Lancer l'app

Aucune installation, aucun build — c'est du HTML/CSS/JS pur :

```bash
# Option 1 : ouvrir directement
open index.html

# Option 2 : petit serveur local (recommandé)
python3 -m http.server 8000
# puis ouvrir http://localhost:8000
```

📱 **Sur téléphone** : ouvre l'app dans le navigateur puis « Ajouter à l'écran d'accueil » — elle s'installe comme une vraie app (PWA).

## ⚙️ Le système d'XP

| Action | XP |
|---|---|
| Séance terminée | 40 base + 8/exercice + bonus durée |
| Difficulté du programme | ×1 débutant, ×1,15 inter, ×1,3 avancé |
| Streak (jours consécutifs) | +5 %/jour, max +50 % |
| Quête journalière | +30 |
| Quêtes hebdo | +100 à +250 |

XP nécessaire pour le niveau suivant : `100 + 12 × niveau` → ~258 700 XP au total pour le niveau 200.

## 🛠️ Stack

Vanilla JS (ES modules), CSS variables pour les skins, localStorage. Zéro dépendance.
