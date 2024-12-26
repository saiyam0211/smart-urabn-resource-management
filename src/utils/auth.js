export const isAuthenticated = () => {
    return !!localStorage.getItem('token');
};

export const getUserType = () => {
    return localStorage.getItem('userType');
};

export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    window.location.href = '/';
};
