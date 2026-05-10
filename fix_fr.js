import fs from 'fs';
import path from 'path';

const file = fs.readFileSync(path.join(process.cwd(), 'public/locales/fr.json'), 'utf-8');
const fr = JSON.parse(file);

const translations = {
  "admin_active_users": "Utilisateurs Actifs",
  "admin_add_cat": "Ajouter Catégorie",
  "admin_add_category": "Ajouter Catégorie",
  "admin_artisan_services": "Services Artisans",
  "admin_btn_cancel": "Annuler",
  "admin_btn_delete": "Supprimer",
  "admin_btn_edit": "Modifier",
  "admin_btn_hide": "Masquer",
  "admin_btn_restore": "Restaurer",
  "admin_btn_save_cat": "Enregistrer Catégorie",
  "admin_btn_save_changes": "Enregistrer les modifications",
  "admin_btn_saving": "Enregistrement...",
  "admin_cat_actions": "Actions",
  "admin_cat_active": "Actif",
  "admin_cat_comm": "Taux de commission",
  "admin_cat_hidden": "Masqué",
  "admin_cat_name": "Nom de la Catégorie",
  "admin_cat_status": "Statut",
  "admin_categories_desc": "Ajouter, modifier ou masquer les catégories de services et de produits.",
  "admin_categories_mgmt": "Gestion des Catégories",
  "admin_commission_desc": "Gérer les frais de la plateforme et les taux de commission.",
  "admin_commission_rules": "Règles de Commission",
  "admin_commission_rules_error": "Échec de la mise à jour des règles de commission.",
  "admin_commission_rules_success": "Règles de commission mises à jour avec succès !",
  "admin_control": "Panneau de Contrôle",
  "admin_conversion_rate": "Taux de Conversion",
  "admin_edit_cat": "Modifier Catégorie",
  "admin_featured_artisan_comm": "Commission Artisan en Vedette (%)",
  "admin_global_material_comm": "Commission Matériaux Globale (%)",
  "admin_global_service_comm": "Commission Service Globale (%)",
  "admin_lbl_cat_name": "Nom de la Catégorie",
  "admin_lbl_comm_rate": "Taux de Commission (0.0 - 1.0)",
  "admin_lbl_comm_rate_desc": "0.10 signifie 10% de commission sur chaque commande.",
  "admin_loading_cats": "Chargement des catégories...",
  "admin_material_sales": "Ventes de Matériaux",
  "admin_panel": "Panneau d'Administration",
  "admin_premium_seller_comm": "Commission Vendeur Premium (%)",
  "admin_recent_activity": "Activité Récente",
  "admin_reports": "Rapports",
  "admin_revenue_overview": "Aperçu des Revenus",
  "admin_search": "Rechercher...",
  "admin_total_bookings": "Réservations Totales",
  "admin_total_revenue": "Revenu Total",
  "admin_wed": "Mercredi",
  "ai_studio_studio": "Studio",
  "auth_success": "Succès !",
  "auth_success_desc": "Votre numéro a été vérifié.",
  "cat_carpentry": "Menuiserie",
  "cat_electricity": "Électricité",
  "cookie_sec1_desc": "Les cookies sont de petits fichiers textes",
  "cookie_sec2_desc": "Nous utilisons les cookies pour plusieurs raisons",
  "cookie_sec3_desc1": "Ces cookies sont strictement nécessaires",
  "cookie_sec3_desc2": "Ces cookies sont utilisés pour améliorer les performances",
  "cookie_sec3_desc3": "Ces cookies collectent des informations qui sont utilisées soit",
  "cookie_sec3_type1": "Cookies Essentiels:",
  "cookie_sec3_type2": "Cookies de Performance et de Fonctionnalité:",
  "cookie_sec3_type3": "Cookies d'Analyse et de Personnalisation:",
  "cookie_sec4_desc": "Vous avez le droit de décider d'accepter ou de refuser les cookies.",
  "crafting_excellence": "Excellence Artisanale",
  "currency_mad": "MAD",
  "dashboard_authorized": "Vérifié",
  "dashboard_avg_rating": "Évaluation Moyenne",
  "dashboard_btn_continue": "Continuer",
  "dashboard_just_now": "À l'instant",
  "dashboard_lbl_active": "Enregistrements Actifs",
  "dashboard_local_auth": "Auth Locale",
  "dashboard_log_session": "Nouvelle Session de Connexion",
  "dashboard_log_success": "Vérification Réussie",
  "dashboard_mins_ago": "Il y a 2 minutes",
  "dashboard_provider": "Fournisseur",
  "dashboard_role": "Rôle",
  "dashboard_security_log": "Journaux de Sécurité",
  "dashboard_unverified": "Compte Non Vérifié",
  "dashboard_verified": "Compte Vérifié",
  "find_ar_all": "Tout",
  "invalid_otp": "Code invalide",
  "invalid_phone": "Numéro de téléphone invalide",
  "login": "Connexion",
  "otp_fallback_msg": "Si le SMS prend trop de temps, nous enverrons une alternative.",
  "otp_sent_to": "Code envoyé à",
  "phone_auth_send_code": "Envoyer le code",
  "phone_auth_title": "Authentification par Téléphone",
  "phone_auth_verify": "Vérifier",
  "resend_in": "Renvoyer dans",
  "resend_now": "Renvoyer le code",
  "terms_sec1_desc": "En accédant ou en utilisant l'application",
  "terms_sec2_desc": "La plateforme fournit un marché",
  "terms_sec3_desc": "Les utilisateurs sont responsables du maintien",
  "terms_sec4_desc": "Les paiements sont traités via notre système sécurisé",
  "terms_sec5_desc": "La plateforme ne sera pas responsable",
  
  "faq_title": "Foire Aux Questions",
  "faq_q1": "Comment réserver un professionnel ?",
  "faq_a1": "Recherchez simplement le service dont vous avez besoin, choisissez un professionnel vérifié et planifiez un rendez-vous directement depuis son profil.",
  "faq_q2": "Les artisans sont-ils tous vérifiés ?",
  "faq_a2": "Oui. Nous effectuons des vérifications strictes des antécédents et examinons leurs travaux passés.",
  "faq_q3": "Comment fonctionne le paiement ?",
  "faq_a3": "Les paiements sont conservés en toute sécurité et ne sont libérés à l'artisan qu'une fois la tâche confirmée comme terminée et satisfaisante.",
  "faq_q4": "Et si je ne suis pas satisfait(e) ?",
  "faq_a4": "Notre équipe d'assistance client est disponible 24/7 pour résoudre les litiges."
};

for (const key in translations) {
  if (fr[key]) {
    fr[key] = translations[key];
  }
}

// Convert "system" texts to French if found
if (fr['link'] === 'link') fr['link'] = 'lien';

function sortObject(obj) {
  return Object.keys(obj).sort().reduce((result, key) => {
    result[key] = obj[key];
    return result;
  }, {});
}

fs.writeFileSync(path.join(process.cwd(), 'public/locales/fr.json'), JSON.stringify(sortObject(fr), null, 2));
console.log('Fixed English strings in fr.json');
