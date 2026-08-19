Voici mon projet

**Root Path:** `/home/esiah/Documents/Dev/App/JeanXXIII-CRM`

├── backend
│ ├── config
│ │ ├── db.ts
│ │ └── mail.ts
│ ├── middleware
│ │ └── auth.ts
│ ├── models
│ │ └── types.ts
│ ├── public
│ │ └── signature.png
│ ├── routes
│ │ ├── automationRoutes.ts
│ │ ├── countryRoutes.ts
│ │ ├── emailTemplateRoutes.ts
│ │ ├── formationRoutes.ts
│ │ ├── lexpressRoutes.ts
│ │ ├── prospectRoutes.ts
│ │ ├── statusRoutes.ts
│ │ └── userRoutes.ts
│ ├── services
│ │ ├── automationService.ts
│ │ ├── countryService.ts
│ │ ├── emailTemplateService.ts
│ │ ├── formationService.ts
│ │ ├── lexpressService.ts
│ │ ├── mailService.ts
│ │ ├── prospectService.ts
│ │ ├── statusService.ts
│ │ └── userService.ts
│ ├── utils
│ │ ├── templateParser.ts
│ │ └── validators.ts
│ ├── .gitignore
│ ├── Dockerfile
│ ├── LICENSE
│ ├── TODO.md
│ ├── index.ts
│ ├── package-lock.json
│ ├── package.json
│ └── tsconfig.json
├── frontend
│ ├── app
│ │ ├── automations
│ │ │ └── page.tsx
│ │ ├── components
│ │ │ ├── DashboardWrapper.tsx
│ │ │ └── Toast.tsx
│ │ ├── hooks
│ │ │ ├── useCrud.ts
│ │ │ └── useProfile.ts
│ │ ├── lib
│ │ │ └── auth.ts
│ │ ├── login
│ │ │ └── page.tsx
│ │ ├── profile
│ │ │ └── page.tsx
│ │ ├── prospects
│ │ │ └── page.tsx
│ │ ├── services
│ │ │ ├── api.ts
│ │ │ ├── automationService.ts
│ │ │ ├── countryService.ts
│ │ │ ├── formationService.ts
│ │ │ ├── lexpressService.ts
│ │ │ ├── prospectService.ts
│ │ │ ├── statusService.ts
│ │ │ ├── templateService.ts
│ │ │ └── userService.ts
│ │ ├── statuses
│ │ │ └── page.tsx
│ │ ├── templates
│ │ │ └── page.tsx
│ │ ├── types
│ │ │ └── index.ts
│ │ ├── users
│ │ │ └── page.tsx
│ │ ├── globals.css
│ │ ├── layout.tsx
│ │ └── page.tsx
│ ├── public
│ │ ├── diapo-bg
│ │ │ ├── bg1.webp
│ │ │ ├── bg2.webp
│ │ │ ├── bg3.webp
│ │ │ ├── bg4.webp
│ │ │ └── bg5.webp
│ │ ├── icons
│ │ │ ├── automations.webp
│ │ │ ├── dashboard.webp
│ │ │ ├── profile.webp
│ │ │ ├── prospects.webp
│ │ │ ├── statuses.webp
│ │ │ ├── templates.webp
│ │ │ └── users.webp
│ │ ├── favicon.ico
│ │ ├── j23-logo.webp
│ │ └── j23.webp
│ ├── .gitignore
│ ├── Dockerfile
│ ├── LICENSE
│ ├── README.md
│ ├── eslint.config.mjs
│ ├── next-env.d.ts
│ ├── next.config.ts
│ ├── package-lock.json
│ ├── package.json
│ ├── postcss.config.mjs
│ └── tsconfig.json
├── .env.example
├── .env.prod
├── Makefile
├── agents.md
├── dbSchema.sql
├── docker-compose.prod.yml
└── docker-compose.yml

Si tu as besoin de consulter un fichier spécifique pour faire des changements demande le moi par la suite et ne l'imagine pas, ne l'hallucine pas. Je t'envoie directement une partie du backend.

faire en sorte que pour un nouveau prospect (fetch par l'apiEXPRESS ou en ajout manuel) la date Dernière action soit aussi modifié automatiquement quand le mail part ou dès qu'il entre en base

supprimer code_postal, niveau, commentaire et situation de la base et de tous les modeles de données et de toutes les requetes en front et back

add more sorting options on prospects

make more responsive to all screens & phones (wallpaper not really covering for exemple et poor lisibility of data on phone)

setting up prod deploiement on local server (frontend, backend & db by merging all datas), the front will be on domain crm.jean23.com and will be reached through cloudflare zero trust tunnel application to not let anyone access my local network
