# imlearning.co.kr DNS 기록 (2026-09-21 확인)

카페24 웹호스팅이 2026-10-04 에 만료된다. 그때 DNS 관리까지 끊기면 아래 값을
새 네임서버(예: Cloudflare)에 그대로 넣어 되살린다. 도메인 등록 자체는
2028-07-02 까지 유효하므로 네임서버는 언제든 바꿀 수 있다.

현재 네임서버: ns1.cafe24.com, ns2.cafe24.com, ns1.cafe24.co.kr, ns2.cafe24.co.kr

| 이름 | 종류 | 값 | 쓰임 |
|---|---|---|---|
| @ | A | 185.199.108.153 | GitHub Pages. 카페24는 하나만 허용해 하나뿐이다 |
| @ | A | 185.199.109.153 | (옮긴 뒤 추가할 것) |
| @ | A | 185.199.110.153 | (옮긴 뒤 추가할 것) |
| @ | A | 185.199.111.153 | (옮긴 뒤 추가할 것) |
| www | CNAME | juel2414.github.io | 사이트 |
| @ | MX 10 | husw7-0754.cafe24.com | 카페24 메일. 계정 0개라 안 옮겨도 된다 |
| send | MX 10 | feedback-smtp.ap-northeast-1.amazonses.com | Resend 반송 처리 |
| send | TXT | v=spf1 include:amazonses.com ~all | 메일 발송 인증 |
| resend._domainkey | TXT | p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC+bPEN2M6yjf9VlUWqtBN8B5csSODHPOOWTQKbTIleqJOlZWYvd0+HzIFKSbiLHohDtt0sMN5sxVoXkjJ7nAyxCkL3vad7HWb7Vfud4/v8/CYJ2BpvYMYVEqaGVTexC8Mm0xU6CtBNImgRSKmSaTXQSL1OcLBb8VEoPep8+V3WWwIDAQAB | 메일 DKIM 서명 |
| _dmarc | TXT | v=DMARC1; p=none; | 메일 정책 |
| _github-pages-challenge-juel2414 | TXT | (GitHub Pages 설정 화면에서 다시 받는다) | 도메인 소유 확인 |
| mail, ftp | A | 185.199.108.153 | 옛 워드프레스 잔재. 안 옮겨도 된다 |

옮긴 뒤 확인할 것
1. https://imlearning.co.kr 열리는지
2. https://www.imlearning.co.kr 인증서 경고가 사라졌는지 (지금은 뜬다)
3. 비밀번호 재설정 메일이 스팸함이 아니라 받은편지함에 오는지
4. 루트 SPF(`v=spf1 include:amazonses.com ~all`)를 새로 넣었는지.
   카페24 폼이 받지 않아 전환 때 사라졌다.
