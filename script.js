/* ==========================================================
   SMART HRD 출결관리 대시보드 - 공통 스크립트
   초보자를 위한 안내:
   - 함수마다 어떤 역할을 하는지 위에 주석을 달아놨습니다.
   - 각 html 파일 맨 아래에서 이 파일을 불러오고 있습니다.
     <script src="js/script.js"></script>
   ========================================================== */

/* 1) 현재 페이지에 맞게 사이드바 메뉴를 강조 표시합니다. */
function highlightActiveNav() {
  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-item").forEach(function (item) {
    const target = item.getAttribute("data-page");
    if (target === currentPage) {
      item.classList.add("active");
    } else {
      item.classList.remove("active");
    }
  });
}

/* 2) 대시보드 실시간 테이블의 탭(전체 / 결석·지각만 / 서류 미제출)을 눌렀을 때
      해당 조건에 맞는 행만 보여줍니다. */
function initRosterTabs() {
  const tabs = document.querySelectorAll(".table-tab");
  if (tabs.length === 0) return;

  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      tabs.forEach(function (t) { t.classList.remove("active"); });
      tab.classList.add("active");

      const filter = tab.getAttribute("data-filter");
      const rows = document.querySelectorAll("table.roster tbody tr");

      rows.forEach(function (row) {
        const status = row.getAttribute("data-status");
        if (filter === "all") {
          row.style.display = "";
        } else if (filter === "issue" && (status === "late" || status === "absent")) {
          row.style.display = "";
        } else if (filter === "nodoc" && row.getAttribute("data-nodoc") === "true") {
          row.style.display = "";
        } else {
          row.style.display = "none";
        }
      });
    });
  });
}

/* 3) 증빙서류 승인 / 반려 버튼 동작
      승인을 누르면 상태 배지를 "승인 완료"로 바꾸고,
      반려를 누르면 반려 사유를 입력받는 창을 띄웁니다. */
function initDocumentActions() {
  document.querySelectorAll(".doc-approve").forEach(function (btn) {
    btn.addEventListener("click", function () {
      const item = btn.closest(".doc-item");
      const statusEl = item.querySelector(".doc-status");
      if (statusEl) {
        statusEl.textContent = "승인 완료";
        statusEl.className = "badge badge-green doc-status";
      }
      btn.disabled = true;
      const rejectBtn = item.querySelector(".doc-reject");
      if (rejectBtn) rejectBtn.disabled = true;
      alert("서류가 승인되었습니다. 해당 결석/지각이 공결로 처리됩니다.");
    });
  });

  document.querySelectorAll(".doc-reject").forEach(function (btn) {
    btn.addEventListener("click", function () {
      const reason = prompt("반려 사유를 입력해 주세요.");
      if (reason === null || reason.trim() === "") {
        alert("반려 사유를 입력해야 처리할 수 있습니다.");
        return;
      }
      const item = btn.closest(".doc-item");
      const statusEl = item.querySelector(".doc-status");
      if (statusEl) {
        statusEl.textContent = "반려됨";
        statusEl.className = "badge badge-red doc-status";
      }
      btn.disabled = true;
      const approveBtn = item.querySelector(".doc-approve");
      if (approveBtn) approveBtn.disabled = true;
      alert("반려 처리되었습니다. 교육생에게 사유가 전달됩니다.\n사유: " + reason);
    });
  });
}

/* 4) 알림 종 아이콘을 눌렀을 때 간단한 안내를 보여줍니다. (프로토타입용) */
function initTopbarIcons() {
  document.querySelectorAll(".icon-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      const label = btn.getAttribute("data-label") || "알림";
      alert(label + " 기능은 프로토타입에서 데모용으로 준비 중입니다.");
    });
  });
}

/* 5) 로그인 유효성 검사 함수
      입력: id 값, pw 값
      출력: 0 = 성공 / 1 = 아이디 누락 / 2 = 비밀번호 누락 */
function loginValidate(id, pw) {
  if (!id || id.trim() === "") {
    return 1;
  }
  if (!pw || pw.trim() === "") {
    return 2;
  }
  return 0;
}

/* 6) 로그인 화면의 버튼과 loginValidate 함수를 연결합니다. */
function initLoginForm() {
  const form = document.getElementById("login-form");
  if (!form) return;

  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    const id = document.getElementById("login-id").value;
    const pw = document.getElementById("login-pw").value;
    const result = loginValidate(id, pw);

    if (result === 1) {
      alert("아이디를 입력해 주세요.");
    } else if (result === 2) {
      alert("비밀번호를 입력해 주세요.");
    } else {
      if (typeof supabaseClient === "undefined") {
        alert("Supabase 연결을 확인해 주세요.");
        return;
      }

      const { error } = await supabaseClient.auth.signInWithPassword({
        email: id,
        password: pw
      });

      if (error) {
        alert("로그인 실패: " + error.message);
        return;
      }

      alert("로그인 성공");
      window.location.href = "index.html";
    }
  });
}

/* 페이지가 로드되면 위 기능들을 전부 실행합니다. */
document.addEventListener("DOMContentLoaded", function () {
  highlightActiveNav();
  initRosterTabs();
  initDocumentActions();
  initTopbarIcons();
  initLoginForm();
});
