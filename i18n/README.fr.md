# Guide de proxy sur votre propre VPS

[简体中文](../README.md) · [English](README.en.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md)

Ce guide couvre le choix du VPS, le déploiement, Clash Verge Rev et le dépannage. Demandez à votre agent de lire README.md et AGENTS.md pour adapter la configuration et les tests à votre réseau et serveur. Utilisez vos propres comptes et serveur ; les configurations sont des exemples.

## Le fournisseur de VPS que j’utilise

J’utilise RackNerd pour mon propre déploiement. Ce guide peut vous aider à choisir une configuration adaptée à vos besoins.

**[Découvrir RackNerd et soutenir les mises à jour du guide](https://my.racknerd.com/aff.php?aff=21220)**

*Si vous achetez via ce lien, je peux percevoir une commission pour soutenir la maintenance et les mises à jour de ce guide. Merci pour votre soutien !*

## Périmètre et état

Ce dépôt fournit un guide et des modèles, pas un service hébergé ni un installateur en un clic. Les contrôles hors ligne sont réussis ; le déploiement complet sur un nouveau VPS n’a pas encore été reproduit. Le serveur et le domaine sont à votre charge. Aucune vitesse identique n’est garantie.

Cette page traduit les instructions essentielles de démarrage. Les documents détaillés liés restent en chinois et constituent la source maintenue. Demandez à votre agent de les expliquer en français. Traduction assistée par IA, sans relecture par un locuteur natif à ce jour.

## Consigne à donner à l’agent

> Lisez d’abord AGENTS.md, README.md et docs/, puis expliquez les étapes en français. Utilisez mes propres comptes et serveurs. Demandez mon budget, opérateur, localisation, système, domaine et disponibilité IPv6. Vérifiez les versions et tarifs officiels actuels. Obtenez mon accord avant tout achat. Sauvegardez les services existants et préservez l’accès SSH. Déployez et testez HY2 avant d’ajouter VLESS/CDN en option, les configurations individuelles et Clash Verge Rev. N’affichez aucun secret et ne modifiez pas les services sans rapport. Signalez explicitement les étapes non vérifiées.

## Étapes de déploiement

Commencez par le lien de soutien RackNerd ci-dessus pour créer votre propre compte et vous connecter. Si vous avez déjà un compte, connectez-vous ; si vous avez un VPS adapté, passez l’achat. Créer un compte ne commande pas de serveur. Avant de choisir ou de payer une offre, transmettez le dépôt et la consigne ci-dessus à votre agent. Faites comparer vos besoins, les tarifs actuels, le renouvellement et les remboursements ; autorisez ensuite vous-même le paiement et attendez l’activation. Saisissez vous-même vos informations et gardez vos identifiants privés.

1. Comparez les tarifs de renouvellement, remboursements, quotas de trafic et prises en charge UDP/IPv6. Testez le trajet réel aux heures de pointe : la distance ne suffit pas à prévoir la qualité.
2. Vérifiez architecture, horloge, ports et pare-feu. Utilisez un certificat valide pour votre domaine avec un SNI correspondant. Gardez l’administration sur l’interface de bouclage via un tunnel SSH.
3. Commencez par Hysteria autonome. Le modèle utilise un mot de passe unique ; une révocation indépendante par utilisateur exige une authentification compatible et des tests réels.
4. Ajoutez Xray VLESS/TLS sur TCP 443 et éventuellement WebSocket/TLS sur 8443. Activez la validation TLS stricte vers l’origine du CDN. Ne faites pas passer HY2 UDP ou Vision TCP par une route CDN WebSocket. Générez le JSON Xray adapté à la version installée et validez-le avant le démarrage.
5. Remplacez tous les REPLACE_* et fournissez à chacun ses propres identifiants et son YAML. Les abonnements automatiques exigent un service HTTPS de distribution vérifié, avec des jetons révocables.
6. Importez la configuration dans Clash Verge Rev, collez le script commun dans l’éditeur d’extension, enregistrez et appliquez le profil. Actualiser l’abonnement télécharge les données ; activer le profil applique la configuration.
7. Testez chaque route, l’accès direct national, HTTPS international, les envois, le redémarrage et la restauration. Testez le proxy système avant TUN. Ne désactivez jamais la vérification du certificat pour masquer une erreur.

## Fonctionnement du script

Les identifiants communs restent `上网线路` (sélection de route) et `自动切换（推荐）` (basculement automatique recommandé). L’ordre automatique est HY2 → CDN → IPv4 ; IPv6 reste manuel et DIRECT est placé en dernier. Le groupe interne est masqué. Les contrôles ont lieu toutes les 30 secondes avec un délai maximal de 5 secondes. Le basculement concerne les connexions suivantes ; une requête déjà échouée peut nécessiter une nouvelle tentative dans l’application.

Utilisez uniquement le modèle de base de ce dépôt, sans écraser un abonnement tiers complexe. Le script remplace groupes et règles, conserve les champs d’authentification et TLS, mais n’assainit pas les abonnements non fiables. Les règles par défaut privilégient l’accès direct aux services chinois ; adaptez leur examen à votre pays et réseau.

## Fichiers communs et contrôles hors ligne

Les exceptions DIRECT comprennent aussi cloudflare.com, cloudflare-dns.com et leurs sous-domaines, mais pas tous les sites hébergés par Cloudflare. Les secrets lus uniquement par leur propriétaire utilisent 600. Les fichiers gérés par root et nécessaires à vpsproxy utilisent root:vpsproxy, les fichiers 640 et les répertoires 750 ; vérifiez les membres du groupe, la traversée des répertoires parents et la lecture par l’utilisateur du service.

- [AGENTS.md](../AGENTS.md)
- [docs/parameters.example.md](../docs/parameters.example.md)
- [docs/deployment.md](../docs/deployment.md)
- [docs/rebuild-runbook.md](../docs/rebuild-runbook.md)
- [docs/verification.md](../docs/verification.md)
- [docs/faq.md](../docs/faq.md)
- [templates/clash.example.yaml](../templates/clash.example.yaml)
- [scripts/shared-profile.js](../scripts/shared-profile.js)
- [SECURITY.md](../SECURITY.md)
- [LICENSE](../LICENSE)

Exécutez ces commandes depuis la racine du dépôt.

```sh
node --test tests/*.test.js
python3 tests/check_docs.py
python3 tests/check_i18n.py
```

[GitHub](https://github.com/koi-lee/vps-selfhost-guide) · [koi-lee](https://github.com/koi-lee)

## Retours et mises à jour

Signalez les étapes peu claires ou les erreurs dans une Issue, avec l’étape, le résultat attendu et le comportement observé. J’améliorerai le guide grâce à vos retours. Retirez mots de passe, clés, liens d’abonnement et informations personnelles.

[Issue](https://github.com/koi-lee/vps-selfhost-guide/issues) · [Soutenir le guide](../SUPPORT.md#fr)

Le soutien est facultatif. Le guide reste gratuit et vos retours sont les bienvenus, avec ou sans contribution financière.
