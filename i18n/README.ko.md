# 개인 VPS 프록시 구축 가이드

[简体中文](../README.md) · [English](README.en.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md)

VPS 선택, 배포, Clash Verge Rev 설정과 문제 해결을 안내합니다. 에이전트가 README.md와 AGENTS.md를 먼저 읽고 본인의 네트워크와 서버에 맞춰 구축과 검증을 돕도록 하세요. 설정은 예제이며 본인의 서버와 계정을 사용해야 합니다.

## 다운로드와 구축 목표

[RackNerd 제휴 링크](https://my.racknerd.com/aff.php?aff=21220) · [Clash Verge Rev 공식 다운로드](https://github.com/clash-verge-rev/clash-verge-rev/releases). 운영체제와 CPU에 맞는 안정 버전을 선택하세요. 제휴 링크로 구매하면 작성자가 수수료를 받을 수 있지만, 구매자에게 추가 할인이 보장되는 것은 아닙니다.

기본 목표는 본인 VPS의 HY2, CDN, IPv4 VLESS 세 경로와 자동 전환입니다. HY2 검증은 중간 단계이며, 이후 예비 경로와 장애 전환 검증까지 진행하세요. IPv6는 선택적인 수동 경로입니다. 별도 VPN 구독은 필요하지 않습니다. [배포 단계표](../docs/deployment.md)에 따라 진행하고 [검증 기록](../docs/verification.md)에 미완료 항목을 남기세요.

## 제가 사용하는 VPS 업체

이 구성은 RackNerd에서 직접 운영하고 있습니다. 예산과 네트워크에 맞는 서버를 이 가이드를 보며 선택하세요.

**[RackNerd 살펴보고 가이드 유지에 보태기](https://my.racknerd.com/aff.php?aff=21220)**

*이 링크를 통해 구매하면 제가 수수료를 받을 수 있습니다. 수수료는 가이드 유지 관리와 업데이트에 사용됩니다. 지원해 주셔서 감사합니다!*

## 범위와 검증 상태

이 저장소는 예제 설정과 안내 문서이며, 호스팅 서비스나 원클릭 설치기가 아닙니다. 오프라인 검사는 통과했지만 새 VPS에서 전체 배포 과정을 재현하지는 않았습니다. 서버와 도메인 비용은 사용자 부담이며 동일한 속도를 보장하지 않습니다.

이 페이지는 핵심 시작 절차의 번역입니다. 아래의 상세 문서는 현재 중국어로 관리되며 기준 문서입니다. 에이전트에게 한국어로 설명하도록 요청하세요. AI 지원 번역이며 원어민 검수는 아직 받지 않았습니다.

## 에이전트에게 보낼 요청

> 먼저 AGENTS.md, README.md와 docs/를 읽고 한국어로 설명하세요. 제 서버와 계정을 사용하세요. 예산, 통신사, 지역, 운영체제, 도메인과 IPv6 지원 여부를 확인하고 최신 공식 버전과 가격을 검토하세요. 결제 전 승인을 받으세요. 기존 서비스를 백업하고 SSH 접속을 유지하세요. HY2, CDN, IPv4 VLESS와 Clash Verge Rev 자동 전환까지 완료하세요. HY2를 먼저 검사한 뒤 배포 단계표에 따라 예비 경로와 장애 전환 검증까지 계속하세요. 비밀 정보를 출력하거나 무관한 서비스를 변경하지 말고, 미검증 단계는 명확히 보고하세요.

## 가족과 친구가 함께 사용하기

여러 사람이 함께 쓰려면 [3X-UI 통합 안내](../docs/3x-ui-family-sharing.md)를 따르세요. 패널이 HY2/CDN/IPv4 인바운드를 관리하고, 사람마다 독립 인증 정보와 HTTPS 구독, 용량 한도, 만료일을 설정합니다. 공식 v3.8.5 문서와 소스를 확인한 안내이며 새 VPS에서 실측했다고 주장하지 않습니다. 같은 포트에서 독립 서비스를 함께 실행하지 마세요. 비용 분담은 구성원 간의 약속이며 패널 결제 기능이 아닙니다. 트래픽 할당은 대역폭 보장이 아닙니다. 테스트 사용자 두 명으로 모든 프로토콜과 해지 후 캐시된 기존 인증 정보까지 검증하세요. 아래 개요는 독립 서비스 경로입니다. 패널 관리에는 링크된 장을 사용하세요.

## 배포 순서

먼저 위의 RackNerd 지원 링크에서 본인 계정을 등록하고 로그인하세요. 기존 계정은 바로 로그인하고, 적합한 VPS가 있으면 구매를 건너뛰세요. 계정 등록만으로 서버가 구매되지는 않습니다. 요금제 선택이나 결제 전에 저장소와 위 요청문을 에이전트에게 전달하세요. 사용 조건, 현재 가격, 갱신 비용과 환불 조건을 비교한 뒤 본인이 결제를 승인하고 개통을 기다리세요. 계정 정보는 직접 입력하고 인증 정보는 비공개로 보관하세요.

1. 갱신 가격, 환불 조건, 트래픽 한도, UDP와 IPv6 지원을 비교하세요. 혼잡 시간대의 실제 경로를 시험하세요. 지리적 거리만으로 속도를 판단할 수 없습니다.
2. 아키텍처, 시간, 포트와 방화벽을 확인하세요. 본인 도메인의 유효한 인증서와 일치하는 SNI를 사용하세요. 관리 화면은 루프백에 바인딩하고 SSH 터널로 접속하세요.
3. 독립 Hysteria 서비스부터 시작하세요. 템플릿은 단일 비밀번호 방식입니다. 사용자별 독립적인 접근 취소에는 지원되는 인증 방식과 실측 검증이 필요합니다.
4. TCP 443에 Xray VLESS/TLS를, 8443에 WebSocket/TLS를 추가하세요. CDN은 엄격한 원본 TLS 검증을 사용하세요. HY2 UDP나 Vision TCP를 WebSocket CDN 경로에 보내지 마세요. 설치 버전에 맞는 Xray JSON을 생성하고 검사한 뒤 시작하세요.
5. 모든 REPLACE_* 값을 바꾸고 사용자마다 고유한 인증 정보와 YAML을 제공하세요. 자동 구독 업데이트는 취소 가능한 토큰을 갖춘 HTTPS 배포 서비스를 별도로 검증해야 합니다.
6. Clash Verge Rev에서 설정을 가져오고 확장 스크립트 편집기에 공통 스크립트를 붙여 넣은 뒤 저장하고 적용하세요. 구독 새로고침은 데이터 다운로드이며, 프로필 활성화는 설정 적용입니다.
7. 각 경로, 국내 직접 연결, 해외 HTTPS, 업로드, 재시작과 복구를 검사하세요. TUN보다 시스템 프록시를 먼저 시험하세요. 오류를 숨기려고 인증서 검증을 끄지 마세요.

## 스크립트 동작

공통 UI 이름은 `上网线路`(경로 선택), `自动切换（推荐）`(자동 전환, 권장)입니다. 자동 순서는 HY2 → CDN → IPv4이며 IPv6는 수동, DIRECT는 마지막입니다. 내부 그룹이 표시되며 검사 간격은 15초, 제한 시간은 5초입니다. 전환은 이후 연결에 적용되므로 이미 실패한 요청은 앱에서 재시도해야 할 수 있습니다.

이 저장소의 기본 템플릿에만 사용하세요. 복잡한 외부 구독을 덮어쓰지 마세요. 그룹과 규칙을 다시 만들지만 인증 정보와 TLS 필드는 유지하며, 신뢰할 수 없는 구독을 정화하지는 않습니다. 중국 서비스 직접 연결을 우선하는 기본 규칙은 본인의 국가와 네트워크에 맞게 검토하세요.

## 공통 파일 및 오프라인 검사

DIRECT 예외에는 cloudflare.com, cloudflare-dns.com 및 하위 도메인도 포함되지만 모든 Cloudflare 호스팅 사이트가 해당하지는 않습니다. 소유자만 읽는 비밀 파일은 기본 600입니다. vpsproxy가 읽어야 하는 root 관리 파일은 root:vpsproxy, 파일 640, 디렉터리 750으로 설정하고 그룹 구성, 상위 디렉터리 통과 권한과 서비스 사용자의 읽기 권한을 확인하세요.

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

다음 명령은 저장소 루트에서 실행하세요.

```sh
node --test tests/*.test.js
python3 tests/check_docs.py
python3 tests/check_copy.py
python3 tests/check_i18n.py
```

[GitHub](https://github.com/koi-lee/vps-selfhost-guide) · [koi-lee](https://github.com/koi-lee)

## 피드백과 업데이트

불명확한 단계나 오류는 해당 단계, 예상 결과와 실제 동작을 Issue에 알려 주세요. 피드백을 바탕으로 개선하겠습니다. 비밀번호, 키, 구독 링크와 개인 정보는 먼저 삭제하세요.

[Issue](https://github.com/koi-lee/vps-selfhost-guide/issues) · [가이드 업데이트 지원](../SUPPORT.md#ko)

지원은 자율입니다. 가이드는 무료이며 지원 여부와 관계없이 피드백을 환영합니다.

자체 경로는 우선순위에 따라 전환하며 항상 최저 지연 노드를 고르지는 않습니다. 느려도 상태 검사를 통과하면 해당 경로가 유지될 수 있습니다. 국내 DNS와 검증 범위는 [클라이언트 안내](../docs/client-failover.md)를 참고하세요. 같은 VPS의 여러 경로는 서버 장애에 대한 이중화가 아닙니다.

간소화 패널은 선택 사항입니다. 기본 스크립트 뒤에 [simplify-panel.js](../scripts/simplify-panel.js)를 추가하면 자동, 수동, 직접 연결을 선택할 수 있습니다. 아래 목록에서 노드를 고른 뒤 위에서 「切换到手动节点」을 선택하고, 평소에는 「自动上网（推荐）」으로 돌아가세요. 추가하지 않았다면 「上网线路」에서 노드를 직접 선택합니다. 공개 스크립트는 비어 있지 않은 외부 `proxy-providers`를 거부합니다. 개인 확장은 별도 설정에 보관하세요. [다른 컴퓨터 설정](../docs/family-client-setup.md)도 확인하세요.
