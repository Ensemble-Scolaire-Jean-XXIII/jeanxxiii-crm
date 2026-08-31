Instructions techniques pour l'Agent IA

Contrainte absolue de l'agent : Ne jamais halluciner de code ou de structure de fichier. Si un fichier est nécessaire pour implémenter une directive, l'agent doit explicitement demander au développeur de lui fournir le contenu du fichier concerné. De plus ne pas écrire de commentaires dans le code et renvoyer les fichiers complets modifiés.

ALTER TABLE prospects ADD COLUMN previous_status_id int(11) DEFAULT NULL;
ALTER TABLE prospects ADD CONSTRAINT fk_prospect_prev_status FOREIGN KEY (previous_status_id) REFERENCES statuses (id) ON DELETE SET NULL;
