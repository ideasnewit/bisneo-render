import commonFilters from "./libs/common.js";
export default function processFilters(req, res, next, conditions, avoidClientId = false) {
    const { filter, pagination } = commonFilters(req, conditions, avoidClientId);
    res.locals.filter = filter;
    res.locals.pagination = pagination || {};
    next();
}
