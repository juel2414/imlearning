/* 휴대폰 번호를 묻는 팝업.
   브라우저 기본 prompt 는 'imlearning.co.kr 내용:' 이 붙어 나와
   결제 직전에 낯설게 보인다. 사이트와 같은 모양으로 묻는다.

   쓰는 법:  const phone = await askPhone();   // 취소하면 null
*/
(function () {
  if (window.askPhone) return;

  var CSS = [
    '.pm-back{position:fixed;inset:0;background:rgba(17,17,17,.55);z-index:4000;',
      'display:flex;align-items:center;justify-content:center;padding:20px;',
      'opacity:0;transition:opacity .14s ease;}',
    '.pm-back.show{opacity:1;}',
    '.pm-card{background:#fff;border-radius:18px;width:100%;max-width:360px;padding:26px 24px 20px;',
      'box-shadow:0 20px 60px rgba(0,0,0,.28);transform:translateY(8px) scale(.98);',
      'transition:transform .16s ease;font-family:inherit;}',
    '.pm-back.show .pm-card{transform:none;}',
    '.pm-title{font-size:17px;font-weight:800;color:#111;letter-spacing:-.3px;}',
    '.pm-desc{font-size:13px;color:#666;line-height:1.65;margin-top:8px;}',
    '.pm-input{width:100%;margin-top:16px;padding:13px 14px;border:1.5px solid #DDE3E0;',
      'border-radius:11px;font-size:16px;font-family:inherit;color:#111;outline:none;',
      'transition:border-color .12s;-webkit-appearance:none;}',
    '.pm-input:focus{border-color:var(--green,#2D9B6F);}',
    '.pm-input.bad{border-color:#E5484D;}',
    '.pm-err{font-size:12px;color:#E5484D;margin-top:7px;min-height:16px;font-weight:600;}',
    '.pm-btns{display:flex;gap:8px;margin-top:12px;}',
    '.pm-btn{flex:1;padding:13px 0;border:none;border-radius:11px;font-size:14.5px;',
      'font-weight:800;cursor:pointer;font-family:inherit;transition:filter .12s;}',
    '.pm-btn:hover{filter:brightness(.96);}',
    '.pm-cancel{background:#F1F4F2;color:#59665F;}',
    '.pm-ok{background:var(--green,#2D9B6F);color:#fff;}'
  ].join('');

  function injectCss() {
    if (document.getElementById('pm-style')) return;
    var st = document.createElement('style');
    st.id = 'pm-style';
    st.textContent = CSS;
    document.head.appendChild(st);
  }

  // 010-1234-5678 꼴로 보여 준다. 저장은 숫자만 한다.
  function pretty(v) {
    var d = v.replace(/[^0-9]/g, '').slice(0, 11);
    if (d.length < 4) return d;
    if (d.length < 8) return d.slice(0, 3) + '-' + d.slice(3);
    return d.slice(0, 3) + '-' + d.slice(3, 7) + '-' + d.slice(7);
  }

  window.askPhone = function (opt) {
    opt = opt || {};
    injectCss();

    return new Promise(function (resolve) {
      var back = document.createElement('div');
      back.className = 'pm-back';
      back.innerHTML =
        '<div class="pm-card" role="dialog" aria-modal="true">' +
          '<div class="pm-title">' + (opt.title || '휴대폰 번호를 알려주세요') + '</div>' +
          '<div class="pm-desc">' + (opt.desc || '결제 확인과 안내 문자를 보내는 데만 씁니다.') + '</div>' +
          '<input class="pm-input" type="tel" inputmode="numeric" autocomplete="tel" ' +
            'placeholder="010-1234-5678">' +
          '<div class="pm-err"></div>' +
          '<div class="pm-btns">' +
            '<button type="button" class="pm-btn pm-cancel">취소</button>' +
            '<button type="button" class="pm-btn pm-ok">확인</button>' +
          '</div>' +
        '</div>';
      document.body.appendChild(back);

      var input  = back.querySelector('.pm-input');
      var err    = back.querySelector('.pm-err');
      var prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      requestAnimationFrame(function () { back.classList.add('show'); input.focus(); });

      function close(val) {
        document.removeEventListener('keydown', onKey, true);
        document.body.style.overflow = prevOverflow;
        back.classList.remove('show');
        setTimeout(function () { back.remove(); }, 150);
        resolve(val);
      }

      function submit() {
        var digits = input.value.replace(/[^0-9]/g, '');
        if (!/^01[016789][0-9]{7,8}$/.test(digits)) {
          err.textContent = '010 으로 시작하는 휴대폰 번호를 입력해 주세요';
          input.classList.add('bad');
          input.focus();
          return;
        }
        close(digits);
      }

      function onKey(e) {
        if (e.key === 'Escape') { e.preventDefault(); close(null); }
        else if (e.key === 'Enter') { e.preventDefault(); submit(); }
      }

      input.addEventListener('input', function () {
        var start = input.selectionStart, before = input.value.length;
        input.value = pretty(input.value);
        // 하이픈이 끼어들면 커서가 뒤로 밀린다
        var moved = input.value.length - before;
        input.setSelectionRange(start + (moved > 0 ? moved : 0), start + (moved > 0 ? moved : 0));
        err.textContent = '';
        input.classList.remove('bad');
      });
      back.querySelector('.pm-ok').addEventListener('click', submit);
      back.querySelector('.pm-cancel').addEventListener('click', function () { close(null); });
      back.addEventListener('click', function (e) { if (e.target === back) close(null); });
      document.addEventListener('keydown', onKey, true);
    });
  };
})();
