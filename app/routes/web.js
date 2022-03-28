const express = require('express');
const router = new express.Router();
const CompanyController = require('../controllers/company-controller');
const UserController = require('../controllers/user-controller');
const PageController = require('../controllers/page-controller');
const upload = require('../services/uploader');

router.get('/', PageController.showHome);
router.get('/firmy', CompanyController.showCompanies);
router.get('/firmy/:name', CompanyController.showCompany);

router.get('/zarejestruj', UserController.showRegister);
router.post('/zarejestruj', UserController.register);
router.get('/zaloguj', UserController.showLogin);
router.post('/zaloguj', UserController.login);
router.get('/wyloguj', UserController.logout);

router.get('/admin/profil', UserController.showProfile);
router.post('/admin/profil', UserController.update);

router.get('/admin/firmy/dodaj', CompanyController.showCreateCompanyForm);
router.post('/admin/firmy/dodaj', upload.single('image'), CompanyController.createCompany);
router.get('/admin/firmy/:name/edytuj', CompanyController.showEditCompanyForm);
router.post('/admin/firmy/:name/edytuj', upload.single('image'), CompanyController.editCompany);
router.get('/admin/firmy/:name/usun', CompanyController.deleteCompany);
router.get('/admin/firmy/:name/usun-zdjecie', CompanyController.deleteImage);

router.get('/csv', CompanyController.getCSV);

router.get('*', PageController.showNotFound);

module.exports = router;