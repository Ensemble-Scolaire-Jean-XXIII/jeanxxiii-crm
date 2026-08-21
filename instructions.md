Instructions techniques pour l'Agent IA

Contrainte absolue de l'agent : Ne jamais halluciner de code ou de structure de fichier. Si un fichier est nécessaire pour implémenter une directive, l'agent doit explicitement demander au développeur de lui fournir le contenu du fichier concerné.
Phase 1 : Système de Logs d'Audit (Admin)

Objectif : Tracer toutes les actions CRUD des utilisateurs et administrateurs et les afficher avec pagination.

Tâches Back-end :

    Base de données : Créer une table audit_logs (ex: id, user_id, action (CREATE, UPDATE, DELETE), resource (prospect, formation, etc.), details (JSON des modifs), created_at).

    Service/Middleware : Créer un utilitaire logAction(userId, action, resource, details) et l'injecter dans les contrôleurs/services existants lors des requêtes POST, PUT, DELETE.

    API : Créer une route protégée GET /api/logs (réservée aux admins) acceptant des paramètres de pagination (?page=1&limit=20).

Tâches Front-end :

    Service : Ajouter logService.ts avec la méthode getLogs(page, limit).

    Vue : Créer une page /logs (ou un onglet dans /users) listant les 20 derniers logs.

    Composant : Implémenter une pagination (Boutons "Précédent" / "Suivant" ou liste de pages) pour naviguer dans l'historique.

Phase 2 : Formulaire "Salons" et Mode Kiosque

Objectif : Créer une page de saisie publique et rapide pour les événements physiques, avec remise à zéro automatique et verrouillage pour le retour au CRM.

Tâches Back-end :

    API Auth : Créer une route POST /api/auth/reauthenticate qui prend l'email (ou l'ID) et le mot de passe, vérifie les credentials, et renvoie un JWT tout neuf (pour prolonger la session).

    API Prospects : S'assurer que la route publique POST /api/salons/prospects (précédemment préparée) insère bien le prospect avec les bons statuts/tags par défaut.

Tâches Front-end :

    Vue "Mode Salon" : Créer la page /salons. Un formulaire épuré. Lors du clic sur "Valider", afficher un message de succès bref et vider immédiatement les champs (remise à zéro) pour le prospect suivant.

    Verrouillage UI : Cacher la sidebar et la topbar habituelles sur cette page.

    Composant Modale (Quitter le salon) : Ajouter un bouton "Quitter le mode salon" discret. Au clic, ouvrir une modale demandant le mot de passe de l'utilisateur actuel. Si succès -> Appel API de réauthentification -> Stockage du nouveau token -> Redirection vers le / (Dashboard).

Phase 3 : Skeletons (Placeholders de chargement UI/UX)

Objectif : Remplacer les textes "Chargement..." par des animations fluides (gradient gris de gauche à droite) épousant la forme des futures données.

Tâches Front-end :

    CSS/Tailwind : Ajouter/utiliser une classe d'animation (ex: animate-pulse ou un keyframe custom pour le balayage) dans globals.css ou la config Tailwind.

    Composant Réutilisable : Créer un composant <Skeleton className="..."/>.

    Intégration : Mettre à jour useCrud.ts (ou les pages) pour exposer l'état isLoading. Dans les vues (Prospects, Users, Dashboard), si isLoading est true, afficher des fausses lignes de tableau ou des fausses cartes statistiques composées de <Skeleton/>.

Phase 4 : Responsive Mobile & Tablette (UI/UX)

Objectif : Rendre l'application utilisable sur petits écrans, avec une refonte spécifique du tableau des prospects.

Tâches Front-end :

    Layout Général : S'assurer que la sidebar se comporte bien en mode mobile (menu burger ou menu caché au profit d'une bottom bar).

    Tableau Prospects (Mobile) :

        Utiliser les classes Tailwind (ex: hidden md:table-cell) pour masquer les colonnes Email, Contact, Pays, Statut, Action, etc., sur mobile.

        Ne garder que la colonne "Nom" et créer une nouvelle colonne (visible uniquement sur mobile) contenant une icône "⋮" ou "Oeil".

    Composant Détails Mobile : Au clic sur l'icône, ouvrir un composant de type Bottom Sheet (tiroir depuis le bas) ou Modale/Toast affichant les données masquées et les boutons d'action (Modifier/Supprimer).
