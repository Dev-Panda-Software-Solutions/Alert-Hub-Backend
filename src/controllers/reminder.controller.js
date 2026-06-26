const svc = require('../services/reminder.service');
const { effectivePlan } = require('../middleware/planGuard');

const list = async (req, res, next) => {
  try {
    const { module, completed, page, limit } = req.query;
    const data = await svc.listReminders(req.user.id, { module, completed, page, limit });
    res.json(data);
  } catch (err) { next(err); }
};

const get = async (req, res, next) => {
  try {
    const r = await svc.getReminder(req.params.id, req.user.id);
    res.json(r);
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const r = await svc.createReminder(req.user.id, req.body, effectivePlan(req.user));
    res.status(201).json(r);
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const r = await svc.updateReminder(req.params.id, req.user.id, req.body, effectivePlan(req.user));
    res.json(r);
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    await svc.deleteReminder(req.params.id, req.user.id);
    res.json({ message: 'Reminder deleted.' });
  } catch (err) { next(err); }
};

const toggle = async (req, res, next) => {
  try {
    const r = await svc.toggleComplete(req.params.id, req.user.id);
    res.json(r);
  } catch (err) { next(err); }
};

const bulkDelete = async (req, res, next) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(422).json({ error: 'ids must be a non-empty array.' });
    }
    const count = await svc.bulkDelete(req.user.id, ids);
    res.json({ message: `${count} reminder(s) deleted.`, count });
  } catch (err) { next(err); }
};

module.exports = { list, get, create, update, remove, toggle, bulkDelete };
