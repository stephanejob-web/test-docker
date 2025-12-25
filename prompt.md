Tâche 1 – Gestion des événements et des langues
🎯 Objectif

Mettre en place une gestion flexible des langues pour les événements, en tenant compte de la langue du speaker et des langues de traduction disponibles lors de l’événement.

🧱 Contexte technique

Table events : contient le champ language_id

Table event_detail : contient le champ speaker_name

📝 Cas d’usage principal

Lors de la création d’un événement, il doit être possible de :

Renseigner le nom du speaker

Définir la langue du speaker

Exemple :

Daniel Kolenda → Anglais

Un speaker brésilien → Portugais (Brésil)

Indiquer les langues de traduction de l’événement

Par exemple :

Traduction en français

Traduction en français + portugais

Autres langues si nécessaire

⚙️ Comportement par défaut

Par défaut, la langue principale de l’événement est le français

La traduction est une option

La majorité des événements auront :

speaker_name en français

Aucun besoin de traduction supplémentaire

🔁 Cas particulier (speaker étranger)

Exemple :
Un évangéliste venant des États-Unis (ex. Daniel Kolenda)

Langue du speaker : Anglais

Langues de traduction disponibles :

Français

(Optionnel) Portugais, Espagnol, etc.

💡 Idée clé

La gestion des langues doit être :

Optionnelle

Flexible

Adaptée aux événements internationaux
dans
Simple pour les événements locaux francophones

✅ Résultat attendu

Une meilleure expérience lors de la création d’événements

Une gestion claire :

de la langue du speaker

des langues de traduction

Une compatibilité avec les événements locaux et internationaux