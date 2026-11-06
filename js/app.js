let currentDocuments = [];
let currentViewingDoc = null;

document.addEventListener('DOMContentLoaded', function() {
  App.init();
});

const App = {
  init: function() {
    this.bindEvents();
    if (Auth.isLoggedIn()) this.loadDashboard();
    else this.showLoginView();
  },

  bindEvents: function() {
    const self = this;
    document.getElementById('loginForm').addEventListener('submit', async function(e) {
      e.preventDefault();
      await self.handleLogin(document.getElementById('loginEmail').value.trim());
    });

    document.querySelectorAll('.demo-login').forEach(function(item) {
      item.addEventListener('click', async function() {
        const email = item.getAttribute('data-email');
        document.getElementById('loginEmail').value = email;
        await self.handleLogin(email);
      });
    });

    document.getElementById('searchInput').addEventListener('input', function() { self.filterDocuments(); });
    document.getElementById('filterStatus').addEventListener('change', function() { self.filterDocuments(); });
    document.getElementById('filterDepartment').addEventListener('change', function() { self.filterDocuments(); });
    document.getElementById('btnRefresh').addEventListener('click', function() { self.loadDashboard(); });

    const fileInput = document.getElementById('uploadFileInput');
    fileInput.addEventListener('change', function() {
      const fileNameEl = document.getElementById('selectedFileName');
      if (fileInput.files.length > 0) {
        fileNameEl.textContent = 'Tệp đã chọn: ' + fileInput.files[0].name;
        fileNameEl.classList.remove('d-none');
      } else {
        fileNameEl.classList.add('d-none');
      }
    });

    document.getElementById('uploadForm').addEventListener('submit', async function(e) {
      e.preventDefault();
      await self.handleUpload();
    });

    document.getElementById('btnApprove').addEventListener('click', async function() {
      await self.handleReviewSubmit('Đã duyệt');
    });

    document.getElementById('btnReject').addEventListener('click', async function() {
      await self.handleReviewSubmit('Yêu cầu sửa');
    });
  },

  showLoginView: function() {
    document.getElementById('loginSection').classList.remove('d-none');
    document.getElementById('dashboardSection').classList.add('d-none');
    UI.renderUserNav(null);
  },

  handleLogin: async function(email) {
    const btn = document.getElementById('btnLogin');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span> Đang xác thực...';

    try {
      const res = await API.login(email);
      if (res.success && res.data) {
        Auth.setUser(res.data);
        UI.showToast('Chào mừng ' + res.data.fullName + '!');
        this.loadDashboard();
      } else {
        UI.showToast(res.message || 'Đăng nhập không thành công', true);
      }
    } catch (err) {
      this.handleDemoLogin(email);
    } finally {
      btn.disabled = false;
      btn.innerHTML = '<i class="bi bi-box-arrow-in-right me-1"></i> Truy Cập Hệ Thống';
    }
  },

  handleDemoLogin: function(email) {
    let mockUser = { email: email, fullName: 'Giáo Viên Mẫu', department: 'Toán - Tin', role: 'GiaoVien' };
    if (email.includes('bgh')) {
      mockUser = { email: email, fullName: 'Hiệu Trưởng Nhà Trường', department: 'Ban Giám Hiệu', role: 'BGH' };
    } else if (email.includes('totruong')) {
      mockUser = { email: email, fullName: 'Tổ Trưởng Chuyên Môn', department: 'Toán - Tin', role: 'ToTruong' };
    }
    Auth.setUser(mockUser);
    UI.showToast('(Chế độ Demo) Đăng nhập quyền: ' + mockUser.role);
    this.loadDashboard();
  },

  loadDashboard: async function() {
    const user = Auth.getUser();
    if (!user) return;
    const self = this;

    document.getElementById('loginSection').classList.add('d-none');
    document.getElementById('dashboardSection').classList.remove('d-none');

    UI.renderUserNav(user, function() {
      Auth.logout();
      self.showLoginView();
      UI.showToast('Đã đăng xuất.');
    });

    const deptCol = document.getElementById('deptFilterCol');
    if (Auth.isBGH()) deptCol.classList.remove('d-none');
    else deptCol.classList.add('d-none');

    try {
      const catRes = await API.getCategories(user.email);
      if (catRes.success && catRes.data) UI.populateCategories(catRes.data);
    } catch (e) {
      UI.populateCategories(['Kế hoạch bài dạy (Giáo án)', 'Đề kiểm tra định kỳ', 'Báo cáo sinh hoạt chuyên đề']);
    }

    try {
      const docRes = await API.getDocuments(user.email);
      if (docRes.success && docRes.data) currentDocuments = docRes.data;
      else currentDocuments = this.getMockDocuments(user);
    } catch (e) {
      currentDocuments = this.getMockDocuments(user);
    }

    this.filterDocuments();
    this.updateStats();
  },

  getMockDocuments: function(user) {
    const list = [
      {
        id: 'DOC_1001',
        title: 'Giáo án Toán 9 - Tuần 8 (Hệ thức lượng)',
        category: 'Kế hoạch bài dạy (Giáo án)',
        fileName: 'GiaoAn_Toan9_Tuan8.docx',
        uploaderName: 'Nguyễn Văn A',
        uploaderEmail: 'gv.anva@truong.edu.vn',
        department: 'Toán - Tin',
        week: 'Tuần 08',
        schoolYear: '2026-2027',
        submittedAt: '03/11/2026 14:30',
        status: 'Chờ duyệt',
        viewUrl: 'https://docs.google.com/document/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/preview',
        feedback: ''
      },
      {
        id: 'DOC_1002',
        title: 'Kế hoạch dạy học Ngữ Văn 8 - Tuần 7',
        category: 'Kế hoạch bài dạy (Giáo án)',
        fileName: 'Van8_Tuan7.pdf',
        uploaderName: 'Trần Thị B',
        uploaderEmail: 'gv.tranb@truong.edu.vn',
        department: 'Ngữ Văn',
        week: 'Tuần 07',
        schoolYear: '2026-2027',
        submittedAt: '01/11/2026 09:15',
        status: 'Đã duyệt',
        viewUrl: 'https://drive.google.com',
        feedback: 'Bài soạn tốt, bám sát yêu cầu cần đạt.'
      }
    ];

    if (user.role === 'GiaoVien') return list.filter(function(d) { return d.uploaderEmail === user.email; });
    if (user.role === 'ToTruong') return list.filter(function(d) { return d.department === user.department; });
    return list;
  },

  filterDocuments: function() {
    const query = document.getElementById('searchInput').value.toLowerCase().trim();
    const status = document.getElementById('filterStatus').value;
    const dept = document.getElementById('filterDepartment').value;
    const self = this;

    const filtered = currentDocuments.filter(function(doc) {
      const matchQuery = !query ||
        doc.title.toLowerCase().includes(query) ||
        doc.uploaderName.toLowerCase().includes(query) ||
        doc.fileName.toLowerCase().includes(query);
      const matchStatus = !status || doc.status === status;
      const matchDept = !dept || doc.department === dept;
      return matchQuery && matchStatus && matchDept;
    });

    UI.renderDocumentsTable(filtered, Auth.getUser(), function(doc) { self.openReviewModal(doc); });
  },

  updateStats: function() {
    UI.renderStats({
      total: currentDocuments.length,
      pending: currentDocuments.filter(function(d) { return d.status === 'Chờ duyệt'; }).length,
      approved: currentDocuments.filter(function(d) { return d.status === 'Đã duyệt'; }).length,
      rejected: currentDocuments.filter(function(d) { return d.status === 'Yêu cầu sửa'; }).length
    });
  },

  handleUpload: async function() {
    const user = Auth.getUser();
    const fileInput = document.getElementById('uploadFileInput');
    if (!fileInput.files.length) {
      UI.showToast('Vui lòng chọn tệp tin cần nộp.', true);
      return;
    }

    const file = fileInput.files[0];
    const docData = {
      category: document.getElementById('uploadCategory').value,
      title: document.getElementById('uploadTitle').value.trim(),
      week: document.getElementById('uploadWeek').value,
      schoolYear: document.getElementById('uploadSchoolYear').value
    };

    const submitBtn = document.getElementById('btnSubmitUpload');
    const progressWrapper = document.getElementById('uploadProgressWrapper');
    submitBtn.disabled = true;
    progressWrapper.classList.remove('d-none');

    try {
      const res = await API.uploadDocument(user.email, docData, file);
      if (res.success) {
        UI.showToast('Nộp hồ sơ thành công!');
        bootstrap.Modal.getInstance(document.getElementById('uploadModal')).hide();
        document.getElementById('uploadForm').reset();
        document.getElementById('selectedFileName').classList.add('d-none');
        await this.loadDashboard();
      } else {
        UI.showToast(res.message || 'Lỗi khi tải tệp lên', true);
      }
    } catch (err) {
      currentDocuments.unshift({
        id: 'DOC_' + Date.now(),
        title: docData.title,
        category: docData.category,
        fileName: file.name,
        uploaderName: user.fullName,
        uploaderEmail: user.email,
        department: user.department,
        week: docData.week,
        schoolYear: docData.schoolYear,
        submittedAt: 'Vừa xong',
        status: 'Chờ duyệt',
        viewUrl: 'https://docs.google.com',
        feedback: ''
      });
      UI.showToast('(Demo) Hồ sơ đã được lưu vào danh sách!');
      bootstrap.Modal.getInstance(document.getElementById('uploadModal')).hide();
      document.getElementById('uploadForm').reset();
      this.filterDocuments();
      this.updateStats();
    } finally {
      submitBtn.disabled = false;
      progressWrapper.classList.add('d-none');
    }
  },

  openReviewModal: function(doc) {
    currentViewingDoc = doc;
    document.getElementById('reviewDocTitle').textContent = doc.title;
    document.getElementById('reviewDocMeta').textContent = doc.uploaderName + ' (' + doc.department + ') • ' + doc.category + ' • ' + doc.submittedAt;
    document.getElementById('previewIframe').src = doc.viewUrl || '';

    const statusBox = document.getElementById('reviewCurrentStatus');
    statusBox.innerHTML = '<span class="badge ' + (doc.status === 'Đã duyệt' ? 'bg-success' : (doc.status === 'Yêu cầu sửa' ? 'bg-danger' : 'bg-warning text-dark')) + ' px-3 py-2">' + doc.status + '</span>';
    document.getElementById('reviewPreviousFeedback').textContent = doc.feedback || 'Chưa có ý kiến nhận xét.';

    const canReview = Auth.canReviewDepartment(doc.department);
    const actionBox = document.getElementById('reviewerActionBox');
    const buttonsArea = document.getElementById('reviewButtonsArea');

    if (canReview) {
      actionBox.classList.remove('d-none');
      buttonsArea.classList.remove('d-none');
      document.getElementById('reviewFeedbackInput').value = doc.feedback || '';
    } else {
      actionBox.classList.add('d-none');
      buttonsArea.classList.add('d-none');
    }

    const modal = new bootstrap.Modal(document.getElementById('reviewModal'));
    modal.show();
  },

  handleReviewSubmit: async function(newStatus) {
    if (!currentViewingDoc) return;
    const user = Auth.getUser();
    const feedback = document.getElementById('reviewFeedbackInput').value.trim();

    try {
      await API.reviewDocument(user.email, currentViewingDoc.id, currentViewingDoc.department, newStatus, feedback);
      UI.showToast('Hồ sơ đã được đánh dấu: ' + newStatus);
    } catch (e) {
      currentViewingDoc.status = newStatus;
      currentViewingDoc.feedback = feedback;
      UI.showToast('(Demo) Đã cập nhật trạng thái: ' + newStatus);
    }

    bootstrap.Modal.getInstance(document.getElementById('reviewModal')).hide();
    this.filterDocuments();
    this.updateStats();
  }
};
