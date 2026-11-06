const UI = {
  renderUserNav: function(user, onLogout) {
    const container = document.getElementById('userArea');
    if (!user) { container.innerHTML = ''; return; }

    let roleBadge = user.role === 'BGH' || user.role === 'Admin'
      ? '<span class="badge bg-danger">BGH</span>'
      : (user.role === 'ToTruong'
         ? '<span class="badge bg-warning text-dark">Tổ trưởng: ' + user.department + '</span>'
         : '<span class="badge bg-info text-dark">GV: ' + user.department + '</span>');

    container.innerHTML = 
      '<div class="text-end d-none d-sm-block text-white">' +
        '<div class="fw-bold">' + user.fullName + '</div>' +
        '<div class="fs-xs text-white-50">' + user.email + ' &bull; ' + roleBadge + '</div>' +
      '</div>' +
      '<button class="btn btn-outline-light btn-sm px-3 rounded-pill" id="btnLogout">' +
        '<i class="bi bi-box-arrow-right me-1"></i> Đăng xuất' +
      '</button>';

    document.getElementById('btnLogout').addEventListener('click', onLogout);
  },

  renderStats: function(stats) {
    document.getElementById('statsContainer').innerHTML = 
      '<div class="col-6 col-lg-3">' +
        '<div class="card border-0 shadow-sm rounded-4 p-3 bg-white">' +
          '<div class="d-flex align-items-center justify-content-between">' +
            '<div><span class="text-muted small d-block">Tổng số hồ sơ</span><h3 class="fw-bold mb-0 text-primary">' + (stats.total || 0) + '</h3></div>' +
            '<div class="p-3 bg-primary bg-opacity-10 rounded-circle text-primary"><i class="bi bi-folder-fill fs-4"></i></div>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="col-6 col-lg-3">' +
        '<div class="card border-0 shadow-sm rounded-4 p-3 bg-white">' +
          '<div class="d-flex align-items-center justify-content-between">' +
            '<div><span class="text-muted small d-block">Chờ duyệt</span><h3 class="fw-bold mb-0 text-warning">' + (stats.pending || 0) + '</h3></div>' +
            '<div class="p-3 bg-warning bg-opacity-10 rounded-circle text-warning"><i class="bi bi-hourglass-split fs-4"></i></div>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="col-6 col-lg-3">' +
        '<div class="card border-0 shadow-sm rounded-4 p-3 bg-white">' +
          '<div class="d-flex align-items-center justify-content-between">' +
            '<div><span class="text-muted small d-block">Đã duyệt</span><h3 class="fw-bold mb-0 text-success">' + (stats.approved || 0) + '</h3></div>' +
            '<div class="p-3 bg-success bg-opacity-10 rounded-circle text-success"><i class="bi bi-check-circle-fill fs-4"></i></div>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="col-6 col-lg-3">' +
        '<div class="card border-0 shadow-sm rounded-4 p-3 bg-white">' +
          '<div class="d-flex align-items-center justify-content-between">' +
            '<div><span class="text-muted small d-block">Cần chỉnh sửa</span><h3 class="fw-bold mb-0 text-danger">' + (stats.rejected || 0) + '</h3></div>' +
            '<div class="p-3 bg-danger bg-opacity-10 rounded-circle text-danger"><i class="bi bi-exclamation-triangle-fill fs-4"></i></div>' +
          '</div>' +
        '</div>' +
      '</div>';
  },

  renderDocumentsTable: function(docs, currentUser, onOpenReview) {
    const tbody = document.getElementById('docsTableBody');
    const emptyState = document.getElementById('emptyState');
    document.getElementById('docCountBadge').textContent = docs.length + ' hồ sơ';

    if (!docs || docs.length === 0) {
      tbody.innerHTML = '';
      emptyState.classList.remove('d-none');
      return;
    }
    emptyState.classList.add('d-none');

    tbody.innerHTML = docs.map(function(doc) {
      let statusBadge = doc.status === 'Đã duyệt'
        ? '<span class="badge badge-status-approved px-2 py-1 rounded-pill"><i class="bi bi-check2 me-1"></i>Đã duyệt</span>'
        : (doc.status === 'Yêu cầu sửa'
           ? '<span class="badge badge-status-rejected px-2 py-1 rounded-pill"><i class="bi bi-exclamation-circle me-1"></i>Yêu cầu sửa</span>'
           : '<span class="badge badge-status-pending px-2 py-1 rounded-pill"><i class="bi bi-clock me-1"></i>Chờ duyệt</span>');

      const canReview = Auth.canReviewDepartment(doc.department);
      const actionBtn = canReview && doc.status === 'Chờ duyệt'
        ? '<button class="btn btn-sm btn-primary-custom px-3 py-1 btn-review-doc" data-id="' + doc.id + '"><i class="bi bi-pencil-square me-1"></i> Kiểm tra & Duyệt</button>'
        : '<button class="btn btn-sm btn-outline-secondary px-3 py-1 btn-review-doc" data-id="' + doc.id + '"><i class="bi bi-eye me-1"></i> Xem chi tiết</button>';

      return '<tr>' +
        '<td class="ps-4">' +
          '<div class="fw-bold text-dark">' + doc.title + '</div>' +
          '<small class="text-muted">' + doc.category + ' &bull; <i class="bi bi-paperclip"></i> ' + doc.fileName + '</small>' +
        '</td>' +
        '<td><div class="fw-semibold">' + doc.uploaderName + '</div><small class="text-muted">' + doc.department + '</small></td>' +
        '<td><span class="badge bg-light text-dark border">' + (doc.week || 'Toàn kỳ') + '</span><div class="fs-xs text-muted mt-1">' + doc.schoolYear + '</div></td>' +
        '<td><small class="text-muted">' + doc.submittedAt + '</small></td>' +
        '<td>' + statusBadge + '</td>' +
        '<td class="text-end pe-4">' + actionBtn + '</td>' +
      '</tr>';
    }).join('');

    document.querySelectorAll('.btn-review-doc').forEach(function(btn) {
      btn.addEventListener('click', function() {
        const docId = btn.getAttribute('data-id');
        const selected = docs.find(function(d) { return d.id === docId; });
        if (selected) onOpenReview(selected);
      });
    });
  },

  populateCategories: function(categories) {
    const select = document.getElementById('uploadCategory');
    select.innerHTML = '<option value="">-- Chọn loại hồ sơ --</option>' +
      categories.map(function(c) { return '<option value="' + c + '">' + c + '</option>'; }).join('');
  },

  showToast: function(message, isError) {
    const toastEl = document.getElementById('liveToast');
    document.getElementById('toastMessage').textContent = message;
    toastEl.classList.remove('bg-success', 'bg-danger', 'bg-primary');
    toastEl.classList.add(isError ? 'bg-danger' : 'bg-success');
    const toast = new bootstrap.Toast(toastEl, { delay: 3500 });
    toast.show();
  }
};
