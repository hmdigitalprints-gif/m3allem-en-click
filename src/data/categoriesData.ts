export interface SubCategory {
  name: string;
  description: string;
  popularServices: string[];
}

export interface CategoryData {
  id: string;
  name: string;
  frenchName: string;
  icon: string;
  description: string;
  subcategories: SubCategory[];
  isDigital: boolean;
  color: string;
}

export const CATEGORIES_DATA: CategoryData[] = [
  {
    id: "home_construction",
    name: "Home & Construction",
    frenchName: "Maison & Bâtiment",
    icon: "Hammer",
    description: "Travaux de construction, gros œuvre, rénovation, et agencement d'intérieur.",
    isDigital: false,
    color: "from-amber-500/20 to-orange-500/10 text-amber-400 border-amber-500/30",
    subcategories: [
      {
        name: "Maçonnerie & Gros œuvre",
        description: "Fondations, murs porteurs, dalles en béton et travaux de structure.",
        popularServices: ["Béton armé", "Ouverture mur porteur", "Chape ciment", "Élévation de murs"]
      },
      {
        name: "Plâtrerie & Cloisons",
        description: "Pose de plaques de plâtre (Placo), faux-plafonds, cloisons amovibles et isolation.",
        popularServices: ["Pose de placo BA13", "Faux-plafond suspendu", "Isolation thermique intérieure"]
      },
      {
        name: "Carrelage & Revêtement de sol",
        description: "Pose de carrelage, parquets, béton ciré et résines de protection.",
        popularServices: ["Pose carrelage grand format", "Ponçage et vitrification parquet", "Pose de parquet flottant"]
      },
      {
        name: "Peinture & Finitions",
        description: "Peinture murale, papiers peints décoratifs et enduits lissés.",
        popularServices: ["Peinture mate/satinée", "Application d'enduit de lissage", "Pose de papier peint panoramique"]
      },
      {
        name: "Architecture & Plans 2D/3D",
        description: "Conception architecturale, plans d'aménagement et modélisation immobilière.",
        popularServices: ["Plan de maison 2D", "Modélisation 3D d'intérieur", "Dossier permis de construire"]
      }
    ]
  },
  {
    id: "repair_maintenance",
    name: "Repair & Maintenance",
    frenchName: "Réparation & Maintenance",
    icon: "Wrench",
    description: "Interventions rapides, dépannages d'urgence, plomberie, électricité et serrurerie.",
    isDigital: false,
    color: "from-blue-500/20 to-cyan-500/10 text-blue-400 border-blue-500/30",
    subcategories: [
      {
        name: "Plomberie (Dépannage & Installation)",
        description: "Réparations de fuites, débouchage de canalisations et installation de sanitaires.",
        popularServices: ["Recherche de fuite d'eau", "Débouchage haute pression", "Changement de mitigeur"]
      },
      {
        name: "Électricité générale & Domotique",
        description: "Remise aux normes électriques, recherche de pannes, installation de prises et domotique.",
        popularServices: ["Remplacement tableau électrique", "Installation de variateurs connectés", "Diagnostic de conformité"]
      },
      {
        name: "Réparation d'appareils Électroménagers",
        description: "Dépannage de machines à laver, réfrigérateurs, lave-vaisselle et fours.",
        popularServices: ["Dépannage lave-linge", "Recharge gaz réfrigérant", "Remplacement résistance de four"]
      },
      {
        name: "Serrurerie d'urgence",
        description: "Ouverture de porte claquée, remplacement de cylindres et sécurisation après effraction.",
        popularServices: ["Ouverture de porte d'urgence", "Changement de serrure 3 points", "Double de clés sécurisées"]
      },
      {
        name: "Maintenance & Réparation de Climatisation (HVAC)",
        description: "Nettoyage de filtres, recharge de climatiseurs et pose de pompes à chaleur.",
        popularServices: ["Entretien climatiseur split", "Recharge fluide frigorigène R32", "Pose de pompe à chaleur"]
      }
    ]
  },
  {
    id: "automotive",
    name: "Automotive",
    frenchName: "Automobile",
    icon: "Car",
    description: "Entretien mécanique, diagnostic, nettoyage et esthétique de véhicules.",
    isDigital: false,
    color: "from-rose-500/20 to-red-500/10 text-rose-400 border-rose-500/30",
    subcategories: [
      {
        name: "Diagnostic Électronique",
        description: "Lecture de codes défauts via valise OBD et effacement de voyants.",
        popularServices: ["Effacement voyant moteur", "Diagnostic batterie et alternateur", "Mise à jour calculateur"]
      },
      {
        name: "Mécanique Générale & Révision",
        description: "Vidange, plaquettes de frein, embrayage et courroies de distribution.",
        popularServices: ["Vidange complète + filtres", "Changement plaquettes/disques", "Remplacement kit embrayage"]
      },
      {
        name: "Lavage & Esthétique Auto (Detailing)",
        description: "Nettoyage en profondeur, polissage carrosserie et protection céramique.",
        popularServices: ["Shampoing intérieur injecteur-extracteur", "Polissage micro-rayures", "Lavage moteur vapeur"]
      },
      {
        name: "Peinture & Carrosserie",
        description: "Débosselage sans peinture, retouche peinture et réparation de pare-chocs.",
        popularServices: ["Débosselage portière/aile", "Retouche rayures carrosserie", "Rénovation optiques de phares"]
      },
      {
        name: "Assistance & Remorquage",
        description: "Dépannage sur place ou transport du véhicule vers un garage.",
        popularServices: ["Démarrage par booster batterie", "Remorquage plateau longue distance"]
      }
    ]
  },
  {
    id: "it_technology",
    name: "IT & Technology",
    frenchName: "Informatique & Technologie",
    icon: "Monitor",
    description: "Support informatique, réparation de matériel, sécurité réseaux et cloud.",
    isDigital: true,
    color: "from-indigo-500/20 to-violet-500/10 text-indigo-400 border-indigo-500/30",
    subcategories: [
      {
        name: "Assistance Informatique à domicile",
        description: "Configuration de PC/Mac, éradication de virus et configuration d'imprimante.",
        popularServices: ["Installation Windows/macOS", "Nettoyage de logiciels malveillants", "Optimisation lenteur système"]
      },
      {
        name: "Réparation de Smartphones & Tablettes",
        description: "Changement d'écrans cassés, remplacement de batteries et de connecteurs de charge.",
        popularServices: ["Remplacement écran iPhone/Samsung", "Changement batterie smartphone", "Sauvegarde de données"]
      },
      {
        name: "Administration Système, Réseau & Cloud",
        description: "Configuration de serveurs, installation de box internet, Wi-Fi mesh, et cloud.",
        popularServices: ["Installation répéteur Wi-Fi", "Configuration de NAS d'entreprise", "Migration vers AWS/Azure"]
      },
      {
        name: "Cyber-sécurité & Audit de sécurité",
        description: "Sécurisation d'infrastructures, audits de vulnérabilité et pare-feu.",
        popularServices: ["Scan de vulnérabilités réseau", "Configuration de VPN d'entreprise", "Sensibilisation phishing"]
      },
      {
        name: "Récupération de Données",
        description: "Restauration de fichiers effacés sur disques durs corrompus ou clés USB.",
        popularServices: ["Récupération de données disque dur HS", "Restauration fichiers effacés par erreur"]
      }
    ]
  },
  {
    id: "web_mobile_dev",
    name: "Web & Mobile Development",
    frenchName: "Développement Web & Mobile",
    icon: "Code",
    description: "Création de sites internet, applications mobiles, No-Code et solutions SaaS.",
    isDigital: true,
    color: "from-emerald-500/20 to-teal-500/10 text-emerald-400 border-emerald-500/30",
    subcategories: [
      {
        name: "Création de Sites Web",
        description: "Vitrine ou E-commerce sous WordPress, Webflow, Shopify ou Prestashop.",
        popularServices: ["Création de site Shopify", "Design personnalisé Webflow", "Maintenance de site WordPress"]
      },
      {
        name: "Développement Web sur-mesure",
        description: "Applications dynamiques complexes en React, Next.js, Angular, Node.js ou Laravel.",
        popularServices: ["Dashboard en React/TypeScript", "Création d'API REST/GraphQL", "Refactoring de code legacy"]
      },
      {
        name: "Développement d'Applications Mobiles",
        description: "Applications natives ou multiplateformes sous Flutter, React Native, Swift ou Kotlin.",
        popularServices: ["Développement d'App Flutter", "Application iOS/Android sur-mesure", "Publication App Store / Play Store"]
      },
      {
        name: "Intégration d'API & Automatisation",
        description: "Connexion de progiciels, mise en place d'automatisations avec Zapier ou Make.",
        popularServices: ["Workflow Zapier complexe", "Intégration CRM / ERP", "Synchronisation de bases de données"]
      },
      {
        name: "Développement No-Code & SaaS",
        description: "Systèmes d'information et outils collaboratifs rapides avec Bubble, Airtable ou Glide.",
        popularServices: ["MVP Bubble.io", "Base de données relationnelle Airtable", "Outil interne Glide"]
      }
    ]
  },
  {
    id: "design_creative",
    name: "Design & Creative",
    frenchName: "Design & Création",
    icon: "Palette",
    description: "Design graphique, interfaces UI/UX, modélisation 3D et identité visuelle.",
    isDigital: true,
    color: "from-pink-500/20 to-purple-500/10 text-pink-400 border-pink-500/30",
    subcategories: [
      {
        name: "Design de Logo & Identité Visuelle",
        description: "Création de logotypes, chartes graphiques complètes et déclinaisons de marque.",
        popularServices: ["Pack Logo & Charte Graphique", "Création de cartes de visite", "Création de kits de marque"]
      },
      {
        name: "UI/UX Design",
        description: "Maquettage haute fidélité pour sites internet et apps mobiles sous Figma.",
        popularServices: ["Design de landing page Figma", "Prototypes interactifs d'applications", "Audit ergonomique UX"]
      },
      {
        name: "Illustrations & Concept Art",
        description: "Dessins sur-mesure, avatars personnalisés, posters et jaquettes.",
        popularServices: ["Portrait vectoriel", "Illustration pour livre d'enfants", "NFT et Digital Art"]
      },
      {
        name: "Modélisation & Rendu 3D",
        description: "Création d'objets ou de scènes 3D sous Blender, rendus photoréalistes.",
        popularServices: ["Modélisation produit 3D", "Rendu photoréaliste architecture", "Animation d'introduction 3D"]
      },
      {
        name: "Packaging & Design de Produits",
        description: "Dessins techniques et création d'emballages innovants et attrayants.",
        popularServices: ["Design de boîte produit", "Étiquettes de bouteilles", "Tracé de découpe de packaging"]
      }
    ]
  },
  {
    id: "digital_marketing",
    name: "Digital Marketing",
    frenchName: "Marketing Digital",
    icon: "TrendingUp",
    description: "Campagnes publicitaires, réseaux sociaux, SEO et tunnels de vente.",
    isDigital: true,
    color: "from-violet-500/20 to-purple-500/10 text-violet-400 border-violet-500/30",
    subcategories: [
      {
        name: "Publicité Payante (Ads)",
        description: "Gestion de campagnes publicitaires sur Google, Facebook, Instagram et LinkedIn.",
        popularServices: ["Campagne Google Search de conversion", "Création de publicités Facebook Ads", "Optimisation de coût par clic"]
      },
      {
        name: "Gestion de Réseaux Sociaux (Community Management)",
        description: "Planification de posts, rédaction et animation de communautés (Instagram, TikTok, etc.).",
        popularServices: ["Calendrier éditorial mensuel", "Montage et sous-titrage de Reels/TikToks", "Gestion de modération"]
      },
      {
        name: "Référencement Naturel (SEO)",
        description: "Optimisation de sites internet pour apparaître au top de Google.",
        popularServices: ["Audit technique SEO complet", "Recherche avancée de mots-clés", "Acquisition de backlinks de qualité"]
      },
      {
        name: "Marketing de Contenu & Copywriting",
        description: "Rédaction persuasive pour pages de vente, articles optimisés et scripts.",
        popularServices: ["Copywriting de page de vente", "Script de vidéo publicitaire", "Fiches produits attractives"]
      },
      {
        name: "Emailing & Tunnels de Vente",
        description: "Scénarisation d'emails marketing (Klaviyo, Mailchimp) et tunnels de conversion.",
        popularServices: ["Séquence de bienvenue automatisée", "Design de template de newsletter", "Tunnel de vente System.io"]
      }
    ]
  },
  {
    id: "training_coaching",
    name: "Training & Coaching",
    frenchName: "Formation & Coaching",
    icon: "GraduationCap",
    description: "Soutien scolaire, apprentissage de langues, développement personnel et professionnel.",
    isDigital: true,
    color: "from-sky-500/20 to-blue-500/10 text-sky-400 border-sky-500/30",
    subcategories: [
      {
        name: "Soutien Scolaire & Aide aux devoirs",
        description: "Aide académique pour élèves du primaire au lycée en sciences, français ou anglais.",
        popularServices: ["Cours particulier de mathématiques ou de physique", "Préparation au baccalauréat", "Méthodologie d'apprentissage"]
      },
      {
        name: "Cours de Langues Étrangères",
        description: "Apprentissage individuel du français, anglais, arabe, espagnol ou allemand.",
        popularServices: ["Conversation orale en anglais professionnel", "Préparation Toefl/IELTS", "Arabe dialectal (Darija)"]
      },
      {
        name: "Coaching Professionnel & Leadership",
        description: "Accompagnement de carrière, préparation aux entretiens et prise de parole.",
        popularServices: ["Simulation d'entretien d'embauche", "Coaching de prise de poste managériale", "Stratégie de reconversion"]
      },
      {
        name: "Formation en Développement Personnel",
        description: "Gestion du stress, organisation du temps, confiance en soi et prise de recul.",
        popularServices: ["Séance d'organisation personnelle", "Techniques d'art oratoire", "Définition d'objectifs de vie"]
      },
      {
        name: "Cours de Musique, Chant & Arts",
        description: "Pratique instrumentale, solfège, chant, dessin et peinture artistique.",
        popularServices: ["Cours de guitare débutant", "Techniques vocales et respiration", "Initiation dessin académique"]
      }
    ]
  },
  {
    id: "health_wellness",
    name: "Health & Wellness",
    frenchName: "Santé & Bien-être",
    icon: "Heart",
    description: "Prestations d'accompagnement physique et bien-être mental, à domicile ou à distance.",
    isDigital: false,
    color: "from-emerald-500/20 to-green-500/10 text-emerald-400 border-emerald-500/30",
    subcategories: [
      {
        name: "Massages & Relaxation",
        description: "Détente musculaire, massages relaxants, suédois, sportifs ou shiatsu.",
        popularServices: ["Massage californien relaxant", "Massage deep tissue musculaire", "Réflexologie plantaire"]
      },
      {
        name: "Coaching Sportif & Fitness",
        description: "Séances de sport individuelles sur-mesure pour perte de poids ou prise de muscle.",
        popularServices: ["Coaching minceur personnalisé", "Entrainement cardio-training", "Remise en forme post-grossesse"]
      },
      {
        name: "Consultations de Nutrition & Diététique",
        description: "Bilans de composition corporelle, plans alimentaires ou rééquilibrage personnalisé.",
        popularServices: ["Établissement de menu hebdomadaire", "Suivi diététique perte de poids", "Bilan nutritionnel initial"]
      },
      {
        name: "Yoga, Pilates & Méditation",
        description: "Cours collectifs ou particuliers de relaxation, respiration et renforcement postural.",
        popularServices: ["Séance d'initiation Hatha Yoga", "Pilates de renforcement des muscles profonds", "Respiration guidée (Pranayama)"]
      },
      {
        name: "Écoute, Thérapie & Psychologique",
        description: "Sessions confidentielles de thérapie de couple, familiale ou individuelle.",
        popularServices: ["Thérapie cognitive comportementale à distance", "Séance d'écoute active anti-stress"]
      }
    ]
  },
  {
    id: "professional_services",
    name: "Professional Services",
    frenchName: "Services Professionnels",
    icon: "Briefcase",
    description: "Support administratif, assistance virtuelle, conseil en management et ressources humaines.",
    isDigital: true,
    color: "from-blue-500/20 to-indigo-500/10 text-blue-400 border-blue-500/30",
    subcategories: [
      {
        name: "Secrétariat Virtuel & Saisie de données",
        description: "Permanence téléphonique, gestion de courriels, et saisie Excel sur-mesure.",
        popularServices: ["Saisie comptable ou de base de données", "Tri de courriels et tri d'agenda", "Mise en page de rapports Word"]
      },
      {
        name: "Recrutement & Conseil RH",
        description: "Rédaction d'offres, sourcing de candidats, création de fiches de poste.",
        popularServices: ["Sourcing de profils sur LinkedIn", "Rédaction de contrat de travail type", "Audit climat social interne"]
      },
      {
        name: "Gestion de projet & Consulting d'affaires",
        description: "Optimisation de processus, mise en place d'outils collaboratifs.",
        popularServices: ["Mise en place de workspace Notion", "Consulting en stratégie d'entreprise", "Mise en place d'un ERP"]
      },
      {
        name: "Enquêtes & Études de marché",
        description: "Analyse sectorielle, rapports statistiques et sondages clients.",
        popularServices: ["Étude d'opportunité d'implantation", "Sondage de satisfaction client", "Benchmarking concurrentiel"]
      },
      {
        name: "Support Client & Assistance commerciale",
        description: "Support client par chat/ticket (Zendesk) et téléprospection ciblée.",
        popularServices: ["Téléprospection B2B qualifiée", "Support client Zendesk 5j/7", "Relance de paniers abandonnés"]
      }
    ]
  },
  {
    id: "transport_logistics",
    name: "Transport & Logistics",
    frenchName: "Transport & Logistique",
    icon: "Truck",
    description: "Déménagement, livraison rapide, location d'utilitaires et chauffeurs privés.",
    isDigital: false,
    color: "from-orange-500/20 to-yellow-500/10 text-orange-400 border-orange-500/30",
    subcategories: [
      {
        name: "Déménagement de Particuliers",
        description: "Formule tout compris (cartons, démontage, transport, remontage).",
        popularServices: ["Déménagement studio de centre-ville", "Transport de meubles fragiles", "Manutentionnaires de renfort"]
      },
      {
        name: "Transport de Marchandises",
        description: "Fret routier, transport palette ou gros volume d'un point A à un point B.",
        popularServices: ["Transport palette inter-villes", "Acheminement matières premières"]
      },
      {
        name: "Livraison Express & Colis",
        description: "Coursiers à moto ou camionnette légère pour envois urgents de documents ou colis.",
        popularServices: ["Course express moto urbaine", "Livraison e-commerce le jour même"]
      },
      {
        name: "Chauffeur Privé (VTC)",
        description: "Voitures de prestige pour transferts aéroports, mariages et déplacements.",
        popularServices: ["Chauffeur transfert aéroport de nuit", "Forfait mise à disposition journée"]
      },
      {
        name: "Location de Véhicules de transport",
        description: "Camionnettes, fourgonnettes et remorques pour déménagements autonomes.",
        popularServices: ["Location utilitaire 12m3 avec chauffeur", "Remorque de transport motos"]
      }
    ]
  },
  {
    id: "home_services",
    name: "Home Services",
    frenchName: "Services à domicile",
    icon: "Home",
    description: "Entretien quotidien de la maison, garde d'enfants, ménage et repassage.",
    isDigital: false,
    color: "from-teal-500/20 to-emerald-500/10 text-teal-400 border-teal-500/30",
    subcategories: [
      {
        name: "Ménage résidentiel & Repassage",
        description: "Nettoyage périodique ou ponctuel des pièces, dépoussiérage et repassage méticuleux.",
        popularServices: ["Forfait ménage hebdomadaire 4h", "Nettoyage fin de bail ou après travaux", "Heures de repassage professionnel"]
      },
      {
        name: "Garde d'enfants (Baby-sitting)",
        description: "Garde après l'école, les week-ends ou animation en fêtes familiales.",
        popularServices: ["Accompagnement sortie d'école", "Baby-sitting soirée de week-end", "Aide aux activités périscolaires"]
      },
      {
        name: "Jardinage & Entretien",
        description: "Tonte de pelouse, taille de haies, élagage et désherbage écologique.",
        popularServices: ["Taille de haies arbustives", "Forfait tonte de pelouse de printemps", "Création de potager urbain"]
      },
      {
        name: "Bricolage & Petits travaux",
        description: "Pose de tringles, montage de meubles en kit, accroche de cadres.",
        popularServices: ["Montage de meuble IKEA", "Pose de tringles à rideaux + miroirs", "Remplacement joint silicone de vasque"]
      },
      {
        name: "Aide aux personnes dépendantes",
        description: "Assistance aux gestes du quotidien, compagnie et courses ménagères.",
        popularServices: ["Accompagnement aux courses et rendez-vous médical", "Préparation de repas équilibrés à domicile"]
      }
    ]
  },
  {
    id: "events",
    name: "Events",
    frenchName: "Événements",
    icon: "Calendar",
    description: "Organisation de réceptions, traiteurs, animations musicales et décorations.",
    isDigital: false,
    color: "from-cyan-500/20 to-teal-500/10 text-cyan-400 border-cyan-500/30",
    subcategories: [
      {
        name: "Traiteur & Organisation",
        description: "Buffets géants, cocktails dinatoires, ou dounias gastronomiques de prestige.",
        popularServices: ["Buffet salé/sucré 50 personnes", "Cocktail cocktail dînatoire corporate", "Traiteur mariage traditionnel"]
      },
      {
        name: "Animation Musicale",
        description: "Prestations d'artistes, DJ qualifiés, magiciens ou groupes de musique.",
        popularServices: ["DJ généraliste de mariage avec sono", "Prestation orchestre andalou/chaabi", "Chanteur solo acoustique"]
      },
      {
        name: "Wedding Planning & Coordination",
        description: "Prise en charge intégrale de la recherche de salle, traiteur, négasfa et timing.",
        popularServices: ["Forfait coordination Jour J", "Planification de mariage clé en main"]
      },
      {
        name: "Décoration de Salles & Mobilier",
        description: "Fonds de scène illuminés, centres de table fleuris, éclairages architecturaux.",
        popularServices: ["Mise en place de trône des mariés", "Éclairage d'ambiance LED", "Location de mange-debout houssés"]
      },
      {
        name: "Planification d'Événements Corporatifs",
        description: "Séminaires d'entreprises, lancements de produits, arbres de Noël et team-buildings.",
        popularServices: ["Organisation de séminaire 100p", "Team-building chasse au trésor"]
      }
    ]
  },
  {
    id: "photography_video",
    name: "Photography & Video",
    frenchName: "Photographie & Vidéo",
    icon: "Camera",
    description: "Captations artistiques, tournages de vidéos promotionnelles, montage de contenus.",
    isDigital: true,
    color: "from-pink-500/20 to-rose-500/10 text-pink-400 border-pink-500/30",
    subcategories: [
      {
        name: "Shooting Photo Personnel",
        description: "Photographies de naissance, de couple, portraits professionnels LinkedIn ou séances mode.",
        popularServices: ["Séance photo solo portrait extérieur", "Shooting photo nouveau-né home studio", "Portraits d'équipe corporate"]
      },
      {
        name: "Montage Vidéo & Post-production",
        description: "Sélection des meilleures prises, ajouts de musique libre, effets et transitions de qualité.",
        popularServices: ["Montage vidéo promotionnelle 1min", "Étalonnage et effets spéciaux", "Correction audio d'interview"]
      },
      {
        name: "Photographie / Vidéographie Commerciale",
        description: "Shootings produits d'e-commerce (packshot), clips réels ou prises de vue intérieures.",
        popularServices: ["Packshot produit fond blanc e-commerce", "Reportage vidéo d'intérieur immobilier", "Vidéo publicitaire UGC"]
      },
      {
        name: "Prise de vue par Drone",
        description: "Survol aérien d'infrastructures ou captations de paysages à haute résolution.",
        popularServices: ["Captation drone promo touristique", "Inspection de toiture par drone"]
      },
      {
        name: "Retouche Photo Professionnelle",
        description: "Correction colorimétrique avancée, détourage de précision et retouches beauté.",
        popularServices: ["Retouche photo portrait beauté", "Détourage en série de 100 photos"]
      }
    ]
  },
  {
    id: "beauty",
    name: "Beauty",
    frenchName: "Beauté",
    icon: "Sparkles",
    description: "Prestations beauté à domicile, soins capillaires, onglerie et esthétique.",
    isDigital: false,
    color: "from-fuchsia-500/20 to-pink-500/10 text-fuchsia-400 border-fuchsia-500/30",
    subcategories: [
      {
        name: "Coiffure à domicile",
        description: "Coupe homme, femme, brushings de fête, décolorations et soins capillaires.",
        popularServices: ["Coupe + coloration femme", "Brushing de soirée express", "Coupe homme stylisée + barbe"]
      },
      {
        name: "Maquillage Professionnel",
        description: "Mise en beauté de mariée, maquillages à thème, soirées ou événements.",
        popularServices: ["Maquillage cocktail chic", "Maquillage complet mariée", "Atelier cours d'auto-maquillage"]
      },
      {
        name: "Soins Esthétiques (Manucure/Pédicure)",
        description: "Soin des mains, pose de gel résine, pose de vernis semi-permanent.",
        popularServices: ["Pose de vernis semi-permanent", "Manucure russe avec gel", "Beauté des pieds complète"]
      },
      {
        name: "Épilation & Soins du visage",
        description: "Épilation cire traditionnelle ou cire tiède, micro-needling, soins hydratants.",
        popularServices: ["Soin visage purifiant d'urgence", "Forfait épilation corps complet", "Restructuration sourcils"]
      },
      {
        name: "Relooking & Conseil en image",
        description: "Analyse colorimétrique, détox garde-robe, accompagnement personnal shopper.",
        popularServices: ["Bilan colorimétrique individuel", "Tri de garde-robe à domicile"]
      }
    ]
  },
  {
    id: "pets",
    name: "Pets",
    frenchName: "Animaux",
    icon: "Dog",
    description: "Soins de compagnie, toilettage, garde d'animaux chez l'habitant et pension.",
    isDigital: false,
    color: "from-lime-500/20 to-green-500/10 text-lime-400 border-lime-500/30",
    subcategories: [
      {
        name: "Toilettage d'Animaux",
        description: "Shampoing, coupe ciseaux, tonte, nettoyage des oreilles de chiens et chats.",
        popularServices: ["Toilettage complet petit chien à domicile", "Tonte hygiénique persan", "Coupe de griffes"]
      },
      {
        name: "Pension & Petsitting",
        description: "Accueil familial pendant vos départs ou vacances scolaires d'animaux domestiques.",
        popularServices: ["Pension canine familiale par jour", "Hébergement de chat en chambre individuelle"]
      },
      {
        name: "Éducation & Comportementalisme",
        description: "Méthodes canines bienveillantes, socialisation et élimination des mauvaises habitudes.",
        popularServices: ["Bilan comportemental canin initial", "Séance de socialisation chiot"]
      },
      {
        name: "Promenades de chiens",
        description: "Balades d'une heure en forêt ou dans les parcs de la ville pour animaux actifs.",
        popularServices: ["Forfait 10 promenades de quartier", "Balade plein air en forêt"]
      },
      {
        name: "Garde à domicile",
        description: "Visites quotidiennes à domicile pour nourrir, changer la litière et divertir.",
        popularServices: ["Visite quotidienne chat à domicile", "Garde de rongeurs et petits mammifères"]
      }
    ]
  },
  {
    id: "crafts",
    name: "Crafts",
    frenchName: "Artisanat",
    icon: "Scissors",
    description: "Travaux d'art traditionnels, ébénisterie, ferronnerie et couture sur-mesure.",
    isDigital: false,
    color: "from-yellow-500/20 to-orange-500/10 text-yellow-400 border-yellow-500/30",
    subcategories: [
      {
        name: "Menuiserie bois",
        description: "Création de placards intégrés, restauration de tables de salon, parquets d'époque.",
        popularServices: ["Fabrication étagère bois massif", "Ponçage et décapage de table vernie", "Restauration de moucharabieh"]
      },
      {
        name: "Ferronnerie d'art",
        description: "Création de grilles de défense forgées à la main, garde-corps ou verrières industrielles.",
        popularServices: ["Soudure de portail endommagé", "Fabrication de verrière acier", "Garde-corps métallique fini"]
      },
      {
        name: "Tapisserie & Réfection de sièges",
        description: "Changement de tissu sur canapés usés, de sangles ou de mousses de fauteuils.",
        popularServices: ["Rempaillage de chaise d'époque", "Forfait réfection fauteuil crapaud"]
      },
      {
        name: "Couture, Retouches & Création",
        description: "Conception de caftans sur-mesure, ajustements de costumes ou ourlets simples.",
        popularServices: ["Création caftan traditionnel haut de gamme", "Couture ourlet de pantalon d'urgence", "Ajustement de robe de mariée"]
      },
      {
        name: "Poterie & Déco Artisanale",
        description: "Objets de décoration uniques en céramique, terre cuite vernissée et zelliges.",
        popularServices: ["Atelier d'initiation au tournage de terre", "Table basse zelliges marocains"]
      }
    ]
  },
  {
    id: "finance_accounting",
    name: "Finance & Accounting",
    frenchName: "Finance & Comptabilité",
    icon: "DollarSign",
    description: "Tenue comptable, déclarations d'impôts, planification financière, audit d'entreprise.",
    isDigital: true,
    color: "from-emerald-500/20 to-green-500/10 text-emerald-400 border-emerald-500/30",
    subcategories: [
      {
        name: "Comptabilité Générale",
        description: "Enregistrement comptable de pièces justificatives, bilans comptables de TPE/PME.",
        popularServices: ["Saisie et vérification des écritures", "Établissement bilan et liasse fiscale"]
      },
      {
        name: "Déclarations Fiscales & Optimisation",
        description: "TVA trimestrielle, impôt sur les sociétés (IS), et impôts sur les salaires (IR).",
        popularServices: ["Calcul de déclaration mensuelle de TVA", "Audit d'optimisation fiscale légale"]
      },
      {
        name: "Conseil Financier & Business Plan",
        description: "Modélisation financière de projets, budgets prévisionnels pour levées de fonds.",
        popularServices: ["Rédaction de dossier Business Plan", "Calcul de plan de trésorerie prévisionnelle"]
      },
      {
        name: "Audit Comptable & Financier",
        description: "Vérification de la sincérité des écritures comptables et des risques.",
        popularServices: ["Audit comptable interne", "Évaluation financière de PME"]
      },
      {
        name: "Gestion de la Paie & Déclarations",
        description: "Réalisation de fiches de paie conformes et déclarations sociales CNSS.",
        popularServices: ["Fiches de paie salariés mensuelle", "Dossier télédéclarations CNSS"]
      }
    ]
  },
  {
    id: "legal",
    name: "Legal",
    frenchName: "Juridique",
    icon: "Scale",
    description: "Rédaction d'actes juridiques, contrats commerciaux, dépôt de marque et médiation.",
    isDigital: true,
    color: "from-blue-500/20 to-slate-500/10 text-blue-400 border-blue-500/30",
    subcategories: [
      {
        name: "Rédaction de Contrats & Status",
        description: "Création de statuts de S.A.R.L, de contrats cadres ou d'accords de confidentialité.",
        popularServices: ["Status clé en main Société", "Contrat de prestation de services types", "Accord NDA de confidentialité"]
      },
      {
        name: "Conseil de Création d'entreprise",
        description: "Accompagnement de l'idée au registre du commerce (guichet unique ou dématérialisé).",
        popularServices: ["Dossier création d'auto-entrepreneur Maroc", "Enregistrement guichet CRI"]
      },
      {
        name: "Marques & Propriété Intellectuelle",
        description: "Recherches d'antériorité de nom de domaine, dépôts de marques auprès de l'OMPIC / INPI.",
        popularServices: ["Dépôt de marque officiel clé en main", "Brevet dépôt technique de conformité"]
      },
      {
        name: "Médiation, Résolution de conflits",
        description: "Négociations amiables de litiges locatifs, différends commerciaux.",
        popularServices: ["Rédaction de protocole d'accord transactionnel", "Négociation litige fournisseur"]
      },
      {
        name: "Audit de Conformité Légale",
        description: "Adaptation de CGV de site e-commerce, mise en conformité RGPD ou lois locales.",
        popularServices: ["Rédaction Mentions Légales et CGV", "Audit de conformité de site aux données personnelles"]
      }
    ]
  },
  {
    id: "translation_writing",
    name: "Translation & Writing",
    frenchName: "Traduction & Rédaction",
    icon: "BookOpen",
    description: "Adaptation de textes multilingues, rédaction d'articles, corrections orthographiques.",
    isDigital: true,
    color: "from-purple-500/20 to-indigo-500/10 text-purple-400 border-purple-500/30",
    subcategories: [
      {
        name: "Traduction Assermentée & Professionnelle",
        description: "Traductions de documents officiels (Français, Arabe, Anglais, Espagnol).",
        popularServices: ["Traduction certifiée d'un extrait d'acte", "Traduction de contrat commercial anglais-français"]
      },
      {
        name: "Rédaction d'Articles de Blog & SEO",
        description: "Rédaction d'articles engageants indexables sur Google selon des règles de SÉO.",
        popularServices: ["Rédaction d'un billet SEO 1500 mots", "Rédaction de communiqué de presse court"]
      },
      {
        name: "Correction & Relecture de Textes",
        description: "Chasse aux coquilles, amélioration stylistique, réécriture de manuscrits professionnels.",
        popularServices: ["Optimisation orthographique de rapport 30p", "Relecture universitaire de mémoire/thèse"]
      },
      {
        name: "Rédaction de Livres Blancs & E-books",
        description: "Rédaction de contenus d'autorité pour capturer des prospects ou vendre en ligne.",
        popularServices: ["Création E-book aimant à prospects", "Rédaction d'un livre blanc industriel"]
      },
      {
        name: "Transcription Audio/Vidéo vers Texte",
        description: "Retypage mot-à-mot ou nettoyé d'entretiens, réunions ou conférences.",
        popularServices: ["Transcription minutée d'un podcast 1h", "Sous-titrage texte de vidéo de formation"]
      }
    ]
  }
];
