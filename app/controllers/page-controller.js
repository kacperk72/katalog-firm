class PageController {

  showHome(req, res) {
    res.render('pages/home', {
      title: 'Strona główna'
    });
  }

  showNotFound(req, res) {
    res.render('errors/404', { 
      title: 'Nie znaleziono',
      layout: 'layouts/minimalistic',
    });
  }

}

module.exports = new PageController();