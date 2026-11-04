# Guía de proxy en tu propio VPS

[简体中文](../README.md) · [English](README.en.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md)

> Periodo de uso: el funcionamiento en China Mobile de Chengdu se confirmó el 2026-08-14; hasta el 2026-11-04 transcurrieron 82 días (casi tres meses). También hubo cortes y problemas de DNS/configuración del cliente que requirieron mantenimiento. No son 82 días de servicio ininterrumpido.

> Pruebas del 2026-11-04 en el Mac existente y la ruta HY2 propia: Google devolvió resultados; un vídeo de YouTube se reprodujo unos 20 segundos; cargó el espacio de Codex con sesión iniciada, sin enviar tareas. TikTok llegó al acceso/verificación de fecha de nacimiento; no se verificaron vídeos. Los registros confirmaron HY2 para estos dominios. No es una prueba de estabilidad prolongada ni de aplicaciones móviles.

> El autor confirma que utiliza esta configuración con un VPS de RackNerd y banda ancha doméstica de China Mobile en Chengdu. Es un caso personal; otras redes y centros de datos requieren pruebas. La guía pública aún no se ha reproducido de principio a fin en un VPS nuevo.

Esta guía cubre la elección del VPS, el despliegue, Clash Verge Rev y la resolución de problemas. Pide al agente leer README.md y AGENTS.md para adaptar la configuración y las pruebas a tu red y servidor. Usa tus propias cuentas y servidor; las configuraciones son ejemplos.

## Descargas y objetivo del despliegue

[Enlace de afiliado de RackNerd](https://my.racknerd.com/aff.php?aff=21220) · [Descargas oficiales de Clash Verge Rev](https://github.com/clash-verge-rev/clash-verge-rev/releases). Elige una versión estable para tu sistema y arquitectura. El autor puede recibir una comisión; el enlace no garantiza un descuento adicional para el comprador.

El objetivo predeterminado son tres rutas en tu propio VPS: HY2, CDN e IPv4 VLESS, con conmutación automática. Probar HY2 primero es una etapa intermedia; continúa con las rutas de respaldo y las pruebas de conmutación. IPv6 es opcional y manual. No necesitas otra suscripción VPN. Sigue la [tabla de etapas](../docs/deployment.md) y registra lo pendiente en la [verificación](../docs/verification.md).

## El proveedor de VPS que utilizo

Esta configuración la tengo montada en RackNerd. Usa la guía para elegir un servidor que encaje con tu presupuesto y tu red.

**[Mira RackNerd y ayúdame a mantener esta guía](https://my.racknerd.com/aff.php?aff=21220)**

*Si compras a través de este enlace, puedo recibir una comisión para apoyar el mantenimiento y las actualizaciones de esta guía. ¡Gracias por tu apoyo!*

## Alcance y estado

Este repositorio contiene instrucciones y plantillas, no un servicio alojado ni un instalador de un clic. Las comprobaciones sin conexión están superadas; todavía no se ha reproducido el despliegue completo en un VPS nuevo. El servidor y el dominio corren por tu cuenta. No se garantiza la misma velocidad.

Esta página traduce las instrucciones esenciales de inicio. Los documentos detallados enlazados siguen en chino y son la fuente mantenida. Pide al agente que los explique en español. Traducción asistida por IA, aún sin revisión de un hablante nativo.

## Petición para el agente

> Lee primero AGENTS.md, README.md y docs/ y explica los pasos en español. Usa mis propios servidores y cuentas. Pregunta por presupuesto, operador, ubicación, sistema, dominio e IPv6. Comprueba las versiones y precios oficiales actuales. Solicita aprobación antes de comprar. Respalda los servicios existentes y conserva el acceso SSH. Completa HY2, CDN e IPv4 VLESS con conmutación automática en Clash Verge Rev. Verifica HY2 primero y continúa con los respaldos y las pruebas de conmutación según la tabla de etapas. No muestres credenciales ni modifiques servicios ajenos a la tarea. Indica claramente los pasos no verificados.

## Compartir con familiares y amigos

Para compartir, sigue la [guía de integración de 3X-UI](../docs/3x-ui-family-sharing.md): entradas HY2/CDN/IPv4 administradas por el panel, identidad y suscripción HTTPS individuales, cuotas, caducidad y revocación. Se basa en documentación y código oficiales de v3.8.5, sin afirmar pruebas en un VPS nuevo. No ejecutes además los servicios independientes en los mismos puertos. Repartir gastos es un acuerdo privado, no un sistema de cobro del panel; las cuotas no reservan ancho de banda. Prueba dos usuarios y todos los protocolos, incluidas las credenciales antiguas almacenadas tras revocarlas. El resumen siguiente describe la ruta independiente; para la ruta del panel utiliza el capítulo enlazado.

## Secuencia de despliegue

Para empezar, rellena en la [tabla local de parámetros](../docs/parameters.example.md) solo el presupuesto, ubicación y operador, sistema del ordenador y si ya tienes VPS y dominio. Deja en blanco los campos técnicos que no entiendas hasta aclararlos. La guía detallada en chino incluye un orden de lectura y definiciones para principiantes. Si no conoces el terminal o la administración de servidores, pide al agente que explique cada paso y dónde ejecutarlo; no pegues una página entera de comandos.

Si ya tienes un VPS adecuado, reutilízalo. Si no, compara antes de registrarte: para uso personal ligero, evalúa planes KVM de alrededor de 1 vCPU y 1 GB de RAM y comprueba ubicación, UDP, tráfico, IPv4, total inicial y renovación. Necesitarás mantener Linux; comprar no configura el servidor. RackNerd es una opción, sin garantía de velocidad ni descuento adicional. Sus condiciones no ofrecen reembolsos automáticos tras el pago. Si decides que encaja, usa el enlace de afiliado de arriba, regístrate y autoriza tú mismo el pago. Mantén tus credenciales privadas. [Condiciones del servicio](https://www.racknerd.com/terms-of-service)

1. Compara renovación, reembolsos, cuota de tráfico y compatibilidad con UDP e IPv6. Prueba la ruta real en horas punta: la distancia no garantiza calidad.
2. Revisa arquitectura, hora, puertos y cortafuegos. Usa un certificado válido para tu dominio y un SNI coincidente. Mantén la administración en loopback mediante un túnel SSH.
3. Empieza con Hysteria independiente. La plantilla usa una sola contraseña; revocar usuarios por separado requiere un método de autenticación compatible y pruebas reales.
4. Añade Xray VLESS/TLS en TCP 443 y WebSocket/TLS en 8443. Usa validación TLS estricta hacia el origen del CDN; no envíes HY2 UDP ni Vision TCP por una ruta CDN WebSocket. Genera el JSON de Xray para la versión instalada y valídalo antes de iniciar.
5. Sustituye todos los REPLACE_* y entrega credenciales y YAML propios a cada usuario. Las suscripciones automáticas necesitan un servicio HTTPS de distribución verificado con tokens revocables.
6. Importa la configuración en Clash Verge Rev, pega el script compartido en el editor de extensiones, guarda y aplica el perfil. Actualizar la suscripción descarga datos; activar el perfil aplica la configuración.
7. Verifica cada ruta, acceso directo nacional, HTTPS internacional, subidas, reinicio y recuperación. Prueba el proxy del sistema antes de TUN. Nunca desactives la validación del certificado para ocultar un error.

## Comportamiento del script

Los identificadores compartidos son `上网线路` (selección de ruta) y `自动切换（推荐）` (conmutación automática recomendada). El orden automático es HY2 → CDN → IPv4; IPv6 es manual y DIRECT queda al final. El grupo interno es visible. Las comprobaciones se realizan cada 15 segundos con un límite de 5 segundos. La conmutación afecta a conexiones posteriores; las solicitudes fallidas pueden requerir reintento en la aplicación.

Úsalo solo con la plantilla básica de este repositorio, no sobre suscripciones complejas de terceros. Reemplaza grupos y reglas, conserva autenticación y TLS, y no sanea suscripciones no fiables. Las reglas predeterminadas favorecen conexiones directas a servicios chinos: revísalas según tu país y red.

## Archivos comunes y pruebas sin conexión

Las excepciones DIRECT también incluyen cloudflare.com, cloudflare-dns.com y sus subdominios, no todos los sitios alojados en Cloudflare. Los secretos que solo lee su propietario usan 600. Los archivos gestionados por root que necesita vpsproxy usan root:vpsproxy, archivos 640 y directorios 750; verifica los miembros del grupo, el acceso a los directorios superiores y la lectura como usuario del servicio.

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

Ejecuta estos comandos desde la raíz del repositorio.

```sh
node --test tests/*.test.js
python3 tests/check_docs.py
python3 tests/check_copy.py
python3 tests/check_i18n.py
```

[GitHub](https://github.com/koi-lee/vps-selfhost-guide) · [koi-lee](https://github.com/koi-lee)

## Comentarios y actualizaciones

Comunica pasos poco claros o errores mediante un Issue, indicando el paso, resultado esperado y comportamiento real. Mejoraré la guía con vuestros comentarios. Elimina contraseñas, claves, enlaces de suscripción y datos personales.

[Issue](https://github.com/koi-lee/vps-selfhost-guide/issues) · [Apoyar la guía](../SUPPORT.md#es)

El apoyo es voluntario. La guía sigue siendo gratuita y puedes enviar comentarios sin contribuir económicamente.

Las rutas propias conmutan por prioridad, no por la menor latencia global. Una ruta lenta que siga pasando las comprobaciones puede mantenerse seleccionada. Consulta la [guía del cliente](../docs/client-failover.md) para DNS y límites de verificación. Todas comparten el VPS y no ofrecen redundancia frente a la caída del servidor.

Panel simplificado opcional: añade [simplify-panel.js](../scripts/simplify-panel.js) al final del script principal. Ofrece modo automático, manual y directo. Elige un nodo abajo y después 「切换到手动节点」 arriba; vuelve a 「自动上网（推荐）」 al terminar. Sin este panel, elige directamente en 「上网线路」. El script público rechaza `proxy-providers` externos no vacíos; conserva las extensiones privadas en otro perfil. Consulta la [configuración de otro ordenador](../docs/family-client-setup.md).
