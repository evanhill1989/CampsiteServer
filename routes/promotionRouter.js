const express = require("express");
const Promotion = require("../models/promotion");

const authenticate = require("../authenticate");
const promotionRouter = express.Router();

promotionRouter
  .route("/")
  .get((req, res, next) => {
    Promotion.find()
      .then((promotions) => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(promotions);
      })
      .catch((err) => next(err));
  })
  .post(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Promotion.create(req.body)
      .then((promotion) => {
        console.log("promotion Created ", promotion);
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(promotion);
      })
      .catch((err) => next(err));
  })
  .put(authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end("PUT operation not supported on /promotions");
  })
  .delete(
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      Promotion.deleteMany()
        .then((response) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(response);
        })
        .catch((err) => next(err));
    }
  );

promotionRouter
  .route("/:promotionId")
  .get((req, res, next) => {
    Promotion.findById(req.params.promotionId)
      .then((promotion) => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(promotion);
      })
      .catch((err) => next(err));
  })
  .post(authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end(
      `POST operation not supported on /promotions/${req.params.promotionId}`
    );
  })
  .put(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Promotion.findByIdAndUpdate(
      req.params.promotionId,
      {
        $set: req.body,
      },
      { new: true }
    )
      .then((promotion) => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(promotion);
      })
      .catch((err) => next(err));
  })
  .delete(
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      Promotion.findByIdAndDelete(req.params.promotionId)
        .then((response) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(response);
        })
        .catch((err) => next(err));
    }
  );

promotionRouter
  .route("/:promotionId/comments")
  .get((req, res, next) => {
    Promotion.findById(req.params.promotionId)
      .then((promotion) => {
        if (promotion) {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(promotion.comments);
        } else {
          err = new Error(`promotion ${req.params.promotionId} not found`);
          err.status = 404;
          return next(err);
        }
      })
      .catch((err) => next(err));
  })
  .post(authenticate.verifyUser, (req, res, next) => {
    Promotion.findById(req.params.promotionId)
      .then((promotion) => {
        if (promotion) {
          promotion.comments.push(req.body);
          promotion
            .save()
            .then((promotion) => {
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.json(promotion);
            })
            .catch((err) => next(err));
        } else {
          err = new Error(`promotion ${req.params.promotionId} not found`);
          err.status = 404;
          return next(err);
        }
      })
      .catch((err) => next(err));
  })
  .put(authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end(
      `PUT operation not supported on /promotions/${req.params.promotionId}/comments`
    );
  })
  .delete(authenticate.verifyUser, (req, res, next) => {
    Promotion.findById(req.params.promotionId)
      .then((promotion) => {
        if (promotion) {
          for (let i = promotion.comments.length - 1; i >= 0; i--) {
            promotion.comments.id(promotion.comments[i]._id).remove();
          }
          promotion
            .save()
            .then((promotion) => {
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.json(promotion);
            })
            .catch((err) => next(err));
        } else {
          err = new Error(`promotion ${req.params.promotionId} not found`);
          err.status = 404;
          return next(err);
        }
      })
      .catch((err) => next(err));
  });

promotionRouter
  .route("/:promotionId/comments/:commentId")
  .get((req, res, next) => {
    Promotion.findById(req.params.promotionId)
      .then((promotion) => {
        if (promotion && promotion.comments.id(req.params.commentId)) {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(promotion.comments.id(req.params.commentId));
        } else if (!promotion) {
          err = new Error(`promotion ${req.params.promotionId} not found`);
          err.status = 404;
          return next(err);
        } else {
          err = new Error(`Comment ${req.params.commentId} not found`);
          err.status = 404;
          return next(err);
        }
      })
      .catch((err) => next(err));
  })
  .post(authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end(
      `POST operation not supported on /promotions/${req.params.promotionId}/comments/${req.params.commentId}`
    );
  })
  .put(authenticate.verifyUser, (req, res, next) => {
    Promotion.findById(req.params.promotionId)
      .then((promotion) => {
        if (promotion && promotion.comments.id(req.params.commentId)) {
          if (req.body.rating) {
            promotion.comments.id(req.params.commentId).rating =
              req.body.rating;
          }
          if (req.body.text) {
            promotion.comments.id(req.params.commentId).text = req.body.text;
          }
          promotion
            .save()
            .then((promotion) => {
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.json(promotion);
            })
            .catch((err) => next(err));
        } else if (!promotion) {
          err = new Error(`promotion ${req.params.promotionId} not found`);
          err.status = 404;
          return next(err);
        } else {
          err = new Error(`Comment ${req.params.commentId} not found`);
          err.status = 404;
          return next(err);
        }
      })
      .catch((err) => next(err));
  })
  .delete(authenticate.verifyUser, (req, res, next) => {
    Promotion.findById(req.params.promotionId)
      .then((promotion) => {
        if (promotion && promotion.comments.id(req.params.commentId)) {
          promotion.comments.id(req.params.commentId).remove();
          promotion
            .save()
            .then((promotion) => {
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.json(promotion);
            })
            .catch((err) => next(err));
        } else if (!promotion) {
          err = new Error(`promotion ${req.params.promotionId} not found`);
          err.status = 404;
          return next(err);
        } else {
          err = new Error(`Comment ${req.params.commentId} not found`);
          err.status = 404;
          return next(err);
        }
      })
      .catch((err) => next(err));
  });

module.exports = promotionRouter;
