Instructions techniques pour l'Agent IA

Contrainte absolue de l'agent : Ne jamais halluciner de code ou de structure de fichier. Si un fichier est nécessaire pour implémenter une directive, l'agent doit explicitement demander au développeur de lui fournir le contenu du fichier concerné. De plus ne pas écrire de commentaires dans le code et renvoyer les fichiers complets modifiés.

Phase 4 : Responsive Mobile & Tablette (UI/UX)

Objectif : Rendre l'application utilisable sur petits écrans, avec une refonte spécifique du tableau des prospects.

Tâches Front-end :

    Layout Général : S'assurer que la sidebar se comporte bien en mode mobile (menu burger ou menu caché au profit d'une bottom bar).

    Tableau Prospects (Mobile) :

        Utiliser les classes Tailwind (ex: hidden md:table-cell) pour masquer les colonnes Email, Contact, Pays, Statut, Action, etc., sur mobile.

        Ne garder que la colonne "Nom" et créer une nouvelle colonne (visible uniquement sur mobile) contenant une icône "⋮" ou "Oeil".

    Composant Détails Mobile : Au clic sur l'icône, ouvrir un composant de type Bottom Sheet (tiroir depuis le bas) ou Modale/Toast affichant les données masquées et les boutons d'action (Modifier/Supprimer).
