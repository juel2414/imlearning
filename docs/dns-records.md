# imlearning.co.kr DNS 옮기기 (카페24 → Cloudflare)

카페24 웹호스팅이 2026-10-04 에 만료된다. 만료 뒤 DNS 관리가 끊기는지 규정에
없어서, 그전에 DNS 를 Cloudflare 로 옮긴다. 도메인 등록 자체는 카페24에
2028-07-02 까지 남는다. 바꾸는 것은 네임서버뿐이다.

## 지금 카페24에 있는 것 (2026-09-21 조회)

| 이름 | 종류 | 값 |
|---|---|---|
| @ | A | 185.199.108.153 |
| @ | MX 10 | husw7-0754.cafe24.com |
| * (와일드카드) | CNAME | imlearning.co.kr |
| www | CNAME | juel2414.github.io |
| send | MX 10 | feedback-smtp.ap-northeast-1.amazonses.com |
| send | TXT | v=spf1 include:amazonses.com ~all |
| resend._domainkey | TXT | p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC+bPEN2M6yjf9VlUWqtBN8B5csSODHPOOWTQKbTIleqJOlZWYvd0+HzIFKSbiLHohDtt0sMN5sxVoXkjJ7nAyxCkL3vad7HWb7Vfud4/v8/CYJ2BpvYMYVEqaGVTexC8Mm0xU6CtBNImgRSKmSaTXQSL1OcLBb8VEoPep8+V3WWwIDAQAB |
| _dmarc | TXT | v=DMARC1; p=none; |

mail·ftp·blog 같은 이름이 응답하는 것은 따로 등록돼서가 아니라 와일드카드 때문이다.

## Cloudflare 에 넣을 것 (최종 목표)

프록시는 전부 **끈다(DNS only, 회색 구름)**. GitHub Pages 가 인증서를 내주므로
주황 구름을 켜면 오히려 꼬인다.

| 이름 | 종류 | 값 | 비고 |
|---|---|---|---|
| @ | A | 185.199.108.153 | GitHub Pages |
| @ | A | 185.199.109.153 | **새로 추가** — 카페24가 막던 것 |
| @ | A | 185.199.110.153 | **새로 추가** |
| @ | A | 185.199.111.153 | **새로 추가** |
| www | CNAME | juel2414.github.io | |
| @ | TXT | v=spf1 include:amazonses.com ~all | **새로 추가** — 전환 때 잃은 루트 SPF |
| send | MX 10 | feedback-smtp.ap-northeast-1.amazonses.com | 메일 반송 |
| send | TXT | v=spf1 include:amazonses.com ~all | 메일 인증 |
| resend._domainkey | TXT | (위 표의 긴 키 그대로) | 메일 서명 |
| _dmarc | TXT | v=DMARC1; p=none; | 메일 정책 |

안 옮기는 것
- `@ MX` (카페24 메일) — 받는 계정이 0개다. 만료되면 어차피 죽는다
- `*` 와일드카드 — 아무 하위 주소나 살아 있을 이유가 없다

## 순서

1. Cloudflare 가입 → 도메인 추가 → Free 플랜
2. 자동으로 읽어 온 기록을 위 표와 대조. 빠진 것 채우고, 프록시 전부 끄기
3. Cloudflare 가 준 네임서버 2개를 카페24 도메인 관리에서 지정
4. 반영 확인 (10분~2시간, 길면 하루)

## 옮긴 뒤 확인

1. `dig +short NS imlearning.co.kr` 이 Cloudflare 네임서버로 바뀌었는지
2. `dig +short A imlearning.co.kr` 가 185.199.108~111.153 네 개인지
3. https://imlearning.co.kr 열리는지
4. https://www.imlearning.co.kr 인증서 경고가 사라졌는지 (GitHub 이 최대 하루)
5. 비밀번호 재설정 메일이 받은편지함에 오는지
