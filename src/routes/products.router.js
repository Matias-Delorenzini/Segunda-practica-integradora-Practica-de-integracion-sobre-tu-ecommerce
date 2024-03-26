import express from 'express';
const router = express.Router();
import ProductsModel from '../dao/models/products.schema.js';

function publicRouteAuth(req, res, next) {
    if (!req.session || !req.session.user) {
        res.redirect("http://localhost:8080/login");
    } else {
        next();
    }
}

router.get('/', publicRouteAuth, async (req, res) => {
    try {
        let limit = parseInt(req.query.limit) || 5;
        let page = req.query.page;
        let sort = req.query.sort;
        let query = req.query.query;

        if(!page){
            page = 1;
        }

        let result;

        let filters = {}
        let sortOptions = {};

        if (sort === 'asc' || sort === 'desc') {
            sortOptions = { price: sort };
        }

        if (query) {
            filters = { ...filters, category: query };
        }
        if (req.query.stock !== null && req.query.stock !== undefined) {
            filters = { ...filters, stock: { $gt: 0 } };
        }

        result = await ProductsModel.paginate(filters, { page, limit, lean: true, sort: sortOptions });

        result.prevLink = result.hasPrevPage ? `http://localhost:8080/api/products?page=${result.prevPage}` : '';
        result.nextLink = result.hasNextPage ? `http://localhost:8080/api/products?page=${result.nextPage}` : '';

        result.isValid = !(isNaN(page) || page <= 0 || page > result.totalPages);

        const userData = req.session.user
        res.render('products', { result, userData });
    } catch (error) {
        res.status(500).json({ status: 'error', error: 'Error al obtener los productos: ' + error.message });
    }
});

export default router;