# Guía de proxy en tu propio VPS

[简体中文](../README.md) · [English](README.en.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md)

Esta guía cubre la elección del VPS, el despliegue, Clash Verge Rev y la resolución de problemas. Pide al agente leer README.md y AGENTS.md para adaptar la configuración y las pruebas a tu red y servidor. Usa tus propias cuentas y servidor; las configuraciones son ejemplos.

## El proveedor de VPS que utilizo

Utilizo RackNerd en mi propio despliegue. Esta guía puede ayudarte a elegir una configuración adecuada para tus necesidades.

**[Explora RackNerd y apoya las actualizaciones de esta guía](https://my.racknerd.com/aff.php?aff=21220)**

*Si compras a través de este enlace, puedo recibir una comisión para apoyar el mantenimiento y las actualizaciones de esta guía. ¡Gracias por tu apoyo!*

## Alcance y estado

Este repositorio contiene instrucciones y plantillas, no un servicio alojado ni un instalador de un clic. Las comprobaciones sin conexión están superadas; todavía no se ha reproducido el despliegue completo en un VPS nuevo. El servidor y el dominio corren por tu cuenta. No se garantiza la misma velocidad.

Esta página traduce las instrucciones esenciales de inicio. Los documentos detallados enlazados siguen en chino y son la fuente mantenida. Pide al agente que los explique en español. Traducción asistida por IA, aún sin revisión de un hablante nativo.

## Petición para el agente

> Lee primero AGENTS.md, README.md y docs/ y explica los pasos en español. Usa mis propios servidores y cuentas. Pregunta por presupuesto, operador, ubicación, sistema, dominio e IPv6. Comprueba las versiones y precios oficiales actuales. Solicita aprobación antes de comprar. Respalda los servicios existentes y conserva el acceso SSH. Despliega y verifica HY2 primero; después añade VLESS/CDN opcionales, configuración individual y Clash Verge Rev. No muestres credenciales ni modifiques servicios ajenos a la tarea. Indica claramente los pasos no verificados.

## Secuencia de despliegue

Primero utiliza el enlace de apoyo a RackNerd de arriba para registrar tu propia cuenta e iniciar sesión. Si ya tienes cuenta, inicia sesión; si ya tienes un VPS adecuado, omite la compra. Registrar una cuenta no compra un servidor. Antes de elegir o pagar un plan, entrega el repositorio y la petición anterior al agente. Pídele comparar tus necesidades, precios actuales, renovación y reembolsos; después autoriza tú mismo el pago y espera la activación. Introduce tú mismo tus datos y mantén las credenciales privadas.

1. Compara renovación, reembolsos, cuota de tráfico y compatibilidad con UDP e IPv6. Prueba la ruta real en horas punta: la distancia no garantiza calidad.
2. Revisa arquitectura, hora, puertos y cortafuegos. Usa un certificado válido para tu dominio y un SNI coincidente. Mantén la administración en loopback mediante un túnel SSH.
3. Empieza con Hysteria independiente. La plantilla usa una sola contraseña; revocar usuarios por separado requiere un método de autenticación compatible y pruebas reales.
4. Añade Xray VLESS/TLS en TCP 443 y, opcionalmente, WebSocket/TLS en 8443. Usa validación TLS estricta hacia el origen del CDN; no envíes HY2 UDP ni Vision TCP por una ruta CDN WebSocket. Genera el JSON de Xray para la versión instalada y valídalo antes de iniciar.
5. Sustituye todos los REPLACE_* y entrega credenciales y YAML propios a cada usuario. Las suscripciones automáticas necesitan un servicio HTTPS de distribución verificado con tokens revocables.
6. Importa la configuración en Clash Verge Rev, pega el script compartido en el editor de extensiones, guarda y aplica el perfil. Actualizar la suscripción descarga datos; activar el perfil aplica la configuración.
7. Verifica cada ruta, acceso directo nacional, HTTPS internacional, subidas, reinicio y recuperación. Prueba el proxy del sistema antes de TUN. Nunca desactives la validación del certificado para ocultar un error.

## Comportamiento del script

Los identificadores compartidos son `上网线路` (selección de ruta) y `自动切换（推荐）` (conmutación automática recomendada). El orden automático es HY2 → CDN → IPv4; IPv6 es manual y DIRECT queda al final. El grupo interno se oculta. Las comprobaciones se realizan cada 30 segundos con un límite de 5 segundos. La conmutación afecta a conexiones posteriores; las solicitudes fallidas pueden requerir reintento en la aplicación.

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
python3 tests/check_i18n.py
```

[GitHub](https://github.com/koi-lee/vps-selfhost-guide) · [koi-lee](https://github.com/koi-lee)

## Comentarios y actualizaciones

Comunica pasos poco claros o errores mediante un Issue, indicando el paso, resultado esperado y comportamiento real. Mejoraré la guía con vuestros comentarios. Elimina contraseñas, claves, enlaces de suscripción y datos personales.

[Issue](https://github.com/koi-lee/vps-selfhost-guide/issues) · [Apoyar la guía](../SUPPORT.md#es)

El apoyo es voluntario. La guía sigue siendo gratuita y puedes enviar comentarios sin contribuir económicamente.
