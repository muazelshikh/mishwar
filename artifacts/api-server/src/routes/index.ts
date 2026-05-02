import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import driversRouter from "./drivers";
import ridesRouter from "./rides";
import groupTripsRouter from "./group_trips";
import subscriptionsRouter from "./subscriptions";
import statsRouter from "./stats";
import inviteTripsRouter from "./invite_trips";
import rentalsRouter from "./rentals";
import driverBookingsRouter from "./driver_bookings";
import driverPortalRouter from "./driver_portal";
import adminRouter from "./admin";
import ownerPortalRouter from "./owner_portal";
import businessPortalRouter from "./business_portal";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(driversRouter);
router.use(ridesRouter);
router.use(groupTripsRouter);
router.use(subscriptionsRouter);
router.use(statsRouter);
router.use(inviteTripsRouter);
router.use(rentalsRouter);
router.use(driverBookingsRouter);
router.use(driverPortalRouter);
router.use(adminRouter);
router.use(ownerPortalRouter);
router.use(businessPortalRouter);

export default router;
