const Auth = {
  STORAGE_KEY: 'edudocs_current_user',
  setUser: function(user) {
    if (!user) sessionStorage.removeItem(this.STORAGE_KEY);
    else sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
  },
  getUser: function() {
    const raw = sessionStorage.getItem(this.STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  },
  logout: function() { sessionStorage.removeItem(this.STORAGE_KEY); },
  isLoggedIn: function() { return this.getUser() !== null; },
  isBGH: function() {
    const u = this.getUser();
    return u && (u.role === 'BGH' || u.role === 'Admin');
  },
  isToTruong: function() {
    const u = this.getUser();
    return u && u.role === 'ToTruong';
  },
  isGiaoVien: function() {
    const u = this.getUser();
    return u && u.role === 'GiaoVien';
  },
  canReviewDepartment: function(dept) {
    if (this.isBGH()) return true;
    const u = this.getUser();
    if (this.isToTruong() && u.department === dept) return true;
    return false;
  }
};
