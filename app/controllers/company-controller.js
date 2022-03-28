const Company = require('../db/models/company');
const fs = require('fs');
const { Parser } = require('json2csv');

class CompanyController {

  async showCompanies(req, res) {
    const { q, sort, countmin, countmax } = req.query;
    const page = req.query.page || 1;
    const perPage = 2;

    const where = {};

    // search
    if (q) {
      where.name = { $regex: q, $options: 'i'};
    }

    // filters
    if (countmin || countmax) {
      where.employeesCount = {};
      if (countmin) where.employeesCount.$gte = countmin;
      if (countmax) where.employeesCount.$lte = countmax;
    }

    let query = Company.find(where);

    // pagination
    query = query.skip((page - 1) * perPage);
    query = query.limit(perPage);

    // sorting
    if (sort) {
      const s = sort.split('|');
      query = query.sort({ [s[0]]: s[1] });
    }

    // exec
    const companies = await query.populate('user').exec();
    const resultsCount = await Company.find(where).countDocuments();
    const pagesCount = Math.ceil(resultsCount / perPage);

    res.render('pages/companies/companies', {
      companies,
      page,
      pagesCount,
      resultsCount
    });
  }

  async showCompany(req, res) {
    const { name } = req.params;
    const company = await Company.findOne({ slug: name });
  
    res.render('pages/companies/company', { 
      name: company?.name,
      title: company?.name ?? 'Brak wyników',
    });
  }

  showCreateCompanyForm(req, res) {
    res.render('pages/companies/create');
  }

  async createCompany(req, res) {
    const company = new Company({
      name: req.body.name,
      slug: req.body.slug,
      employeesCount: req.body.employeesCount,
      user: req.session.user._id
    });

    try {
      await company.save();
      res.redirect('/firmy');
    } catch (e) {
      res.render('pages/companies/create', {
        errors: e.errors,
        form: req.body
      });
    }
  }

  async showEditCompanyForm(req, res) {
    const { name } = req.params;
    const company = await Company.findOne({ slug: name });

    res.render('pages/companies/edit', {
      form: company
    });
  }

  async editCompany(req, res) {
    const { name } = req.params;
    const company = await Company.findOne({ slug: name });
    company.name = req.body.name;
    company.slug = req.body.slug;
    company.employeesCount = req.body.employeesCount;

    if (req.file && company.image) {
      fs.unlinkSync('public/uploads/' + company.image);
    }
    if (req.file) {
      company.image = req.file.filename;
    }


    try {
      await company.save();
      res.redirect('/firmy');
    } catch (e) {
      res.render('pages/companies/edit', {
        errors: e.errors,
        form: req.body
      });
    }
  }

  async deleteCompany(req, res) {
    const { name } = req.params;
    const company = await Company.findOne({ slug: name });
    try {
      if (company.image) {
        fs.unlinkSync('public/uploads/' + company.image);
      }
      await Company.deleteOne({ slug: name });
      res.redirect('/firmy');
    } catch (e) {
      //
    }
  }

  async deleteImage(req, res) {
    const { name } = req.params;
    const company = await Company.findOne({ slug: name });
    try {
      fs.unlinkSync('public/uploads/' + company.image);
      company.image = '';
      await company.save();

      res.redirect('/firmy');
    } catch (e) {
      //
    }
  }

  async getCSV(req, res) {
    const fields = [
      {
        label: 'Nazwa',
        value: 'name'
      },
      {
        label: 'URL',
        value: 'slug'
      },
      {
        label: 'Liczba pracowników',
        value: 'employeesCount'
      },
    ];
    const data = await Company.find();
    const fileName = 'companies.csv';

    const json2csv = new Parser({ fields });
    const csv = json2csv.parse(data);

    res.header('Content-Type', 'text/csv');
    res.attachment(fileName);
    res.send(csv);
  }
  
}

module.exports = new CompanyController();