# Guide de proxy sur votre propre VPS

[简体中文](../README.md) · [English](README.en.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md)

Ce guide couvre le choix du VPS, le déploiement, Clash Verge Rev et le dépannage. Demandez à votre agent de lire README.md et AGENTS.md pour adapter la configuration et les tests à votre réseau et serveur. Utilisez vos propres comptes et serveur ; les configurations sont des exemples.

## Téléchargements et objectif du déploiement

[Lien affilié RackNerd](https://my.racknerd.com/aff.php?aff=21220) · [Téléchargements officiels de Clash Verge Rev](https://github.com/clash-verge-rev/clash-verge-rev/releases). Choisissez une version stable adaptée au système et au processeur. L’auteur peut percevoir une commission ; ce lien ne garantit pas de réduction supplémentaire à l’acheteur.

L’objectif par défaut comprend trois routes sur votre VPS : HY2, CDN et IPv4 VLESS, avec basculement automatique. Tester HY2 est une étape intermédiaire ; poursuivez avec les routes de secours et les tests de basculement. IPv6 est facultatif et manuel. Aucun abonnement VPN supplémentaire n’est nécessaire. Suivez le [tableau des étapes](../docs/deployment.md) et notez les éléments incomplets dans la [vérification](../docs/verification.md).

## Le fournisseur de VPS que j’utilise

Cette configuration tourne chez RackNerd. Utilisez le guide pour choisir un serveur adapté à votre budget et à votre réseau.

**[Voir RackNerd et m’aider à maintenir le guide](https://my.racknerd.com/aff.php?aff=21220)**

*Si vous achetez via ce lien, je peux percevoir une commission pour soutenir la maintenance et les mises à jour de ce guide. Merci pour votre soutien !*

## Périmètre et état

Ce dépôt fournit un guide et des modèles, pas un service hébergé ni un installateur en un clic. Les contrôles hors ligne sont réussis ; le déploiement complet sur un nouveau VPS n’a pas encore été reproduit. Le serveur et le domaine sont à votre charge. Aucune vitesse identique n’est garantie.

Cette page traduit les instructions essentielles de démarrage. Les documents détaillés liés restent en chinois et constituent la source maintenue. Demandez à votre agent de les expliquer en français. Traduction assistée par IA, sans relecture par un locuteur natif à ce jour.

## Consigne à donner à l’agent

> Lisez d’abord AGENTS.md, README.md et docs/, puis expliquez les étapes en français. Utilisez mes propres comptes et serveurs. Demandez mon budget, opérateur, localisation, système, domaine et disponibilité IPv6. Vérifiez les versions et tarifs officiels actuels. Obtenez mon accord avant tout achat. Sauvegardez les services existants et préservez l’accès SSH. Terminez HY2, CDN et IPv4 VLESS avec le basculement automatique de Clash Verge Rev. Testez HY2 puis poursuivez avec les routes de secours et les tests de basculement selon le tableau des étapes. N’affichez aucun secret et ne modifiez pas les services sans rapport. Signalez explicitement les étapes non vérifiées.

## Partager avec la famille et les amis

Pour un usage partagé, suivez le [guide d’intégration 3X-UI](../docs/3x-ui-family-sharing.md) : entrées HY2/CDN/IPv4 gérées par le panneau, identité et abonnement HTTPS individuels, quotas, expiration et révocation. Il s’appuie sur la documentation et le code officiels v3.8.5, sans prétendre à un test sur un nouveau VPS. Ne lancez pas aussi les services autonomes sur les mêmes ports. Le partage des frais est un accord privé, pas un service de paiement du panneau ; les quotas ne réservent pas de bande passante. Testez deux utilisateurs et tous les protocoles, y compris les anciennes configurations après révocation. Le résumé ci-dessous décrit la voie autonome ; utilisez le chapitre lié pour la gestion par panneau.

## Étapes de déploiement

Commencez par le lien de soutien RackNerd ci-dessus pour créer votre propre compte et vous connecter. Si vous avez déjà un compte, connectez-vous ; si vous avez un VPS adapté, passez l’achat. Créer un compte ne commande pas de serveur. Avant de choisir ou de payer une offre, transmettez le dépôt et la consigne ci-dessus à votre agent. Faites comparer vos besoins, les tarifs actuels, le renouvellement et les remboursements ; autorisez ensuite vous-même le paiement et attendez l’activation. Saisissez vous-même vos informations et gardez vos identifiants privés.

1. Comparez les tarifs de renouvellement, remboursements, quotas de trafic et prises en charge UDP/IPv6. Testez le trajet réel aux heures de pointe : la distance ne suffit pas à prévoir la qualité.
2. Vérifiez architecture, horloge, ports et pare-feu. Utilisez un certificat valide pour votre domaine avec un SNI correspondant. Gardez l’administration sur l’interface de bouclage via un tunnel SSH.
3. Commencez par Hysteria autonome. Le modèle utilise un mot de passe unique ; une révocation indépendante par utilisateur exige une authentification compatible et des tests réels.
4. Ajoutez Xray VLESS/TLS sur TCP 443 et WebSocket/TLS sur 8443. Activez la validation TLS stricte vers l’origine du CDN. Ne faites pas passer HY2 UDP ou Vision TCP par une route CDN WebSocket. Générez le JSON Xray adapté à la version installée et validez-le avant le démarrage.
5. Remplacez tous les REPLACE_* et fournissez à chacun ses propres identifiants et son YAML. Les abonnements automatiques exigent un service HTTPS de distribution vérifié, avec des jetons révocables.
6. Importez la configuration dans Clash Verge Rev, collez le script commun dans l’éditeur d’extension, enregistrez et appliquez le profil. Actualiser l’abonnement télécharge les données ; activer le profil applique la configuration.
7. Testez chaque route, l’accès direct national, HTTPS international, les envois, le redémarrage et la restauration. Testez le proxy système avant TUN. Ne désactivez jamais la vérification du certificat pour masquer une erreur.

## Fonctionnement du script

Les identifiants communs restent `上网线路` (sélection de route) et `自动切换（推荐）` (basculement automatique recommandé). L’ordre automatique est HY2 → CDN → IPv4 ; IPv6 reste manuel et DIRECT est placé en dernier. Le groupe interne est visible. Les contrôles ont lieu toutes les 15 secondes avec un délai maximal de 5 secondes. Le basculement concerne les connexions suivantes ; une requête déjà échouée peut nécessiter une nouvelle tentative dans l’application.

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
python3 tests/check_copy.py
python3 tests/check_i18n.py
```

[GitHub](https://github.com/koi-lee/vps-selfhost-guide) · [koi-lee](https://github.com/koi-lee)

## Retours et mises à jour

Signalez les étapes peu claires ou les erreurs dans une Issue, avec l’étape, le résultat attendu et le comportement observé. J’améliorerai le guide grâce à vos retours. Retirez mots de passe, clés, liens d’abonnement et informations personnelles.

[Issue](https://github.com/koi-lee/vps-selfhost-guide/issues) · [Soutenir le guide](../SUPPORT.md#fr)

Le soutien est facultatif. Le guide reste gratuit et vos retours sont les bienvenus, avec ou sans contribution financière.

Les routes du VPS basculent par priorité, sans sélectionner systématiquement la latence minimale. Une route lente qui réussit les contrôles peut rester utilisée. Consultez le [guide du client](../docs/client-failover.md) pour le DNS et les limites de vérification. Plusieurs routes sur le même VPS ne protègent pas contre une panne du serveur.

Panneau simplifié facultatif : ajoutez [simplify-panel.js](../scripts/simplify-panel.js) après le script principal. Il propose les modes automatique, manuel et direct. Choisissez un nœud en bas puis 「切换到手动节点」 en haut ; revenez ensuite à 「自动上网（推荐）」. Sans ce panneau, choisissez directement dans 「上网线路」. Le script public refuse les `proxy-providers` externes non vides ; conservez les extensions privées dans un autre profil. Voir la [configuration d’un autre ordinateur](../docs/family-client-setup.md).
