import commonFilters from "./libs/common.js";
export default function processFilters(req, res, next, conditions) {
    const { filter, pagination } = commonFilters(req, conditions);
    res.locals.filter = filter;
    res.locals.pagination = pagination || {};
    next();
}
