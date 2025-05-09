const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { Course, User, Payment, Progress } = require('../models');
const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Create payment intent for direct payment processing
// @route   POST /api/v1/payments/create-payment-intent
// @access  Private
exports.createPaymentIntent = asyncHandler(async (req, res, next) => {
  const { courseId } = req.body;

  if (!courseId) {
    return next(new ErrorResponse('Please provide a course ID', 400));
  }

  const course = await Course.findById(courseId);

  if (!course) {
    return next(new ErrorResponse(`Course not found with id of ${courseId}`, 404));
  }

  // Check if the user is already enrolled
  if (course.enrolledStudents.includes(req.user.id)) {
    return next(new ErrorResponse('You are already enrolled in this course', 400));
  }

  // For free courses, enroll directly
  if (course.price <= 0) {
    // Add user to enrolledStudents
    course.enrolledStudents.push(req.user.id);
    await course.save();

    // Add course to user's enrolledCourses
    await User.findByIdAndUpdate(req.user.id, {
      $push: { enrolledCourses: course._id }
    });

    // Create initial progress record
    await Progress.create({
      user: req.user.id,
      course: course._id,
      completedLessons: []
    });

    return res.status(200).json({
      success: true,
      data: {
        message: 'Successfully enrolled in free course',
        course
      }
    });
  }

  try {
    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(course.price * 100), // Amount in cents
      currency: 'usd',
      metadata: {
        courseId: course._id.toString(),
        userId: req.user.id,
        integration_check: 'accept_a_payment'
      },
      receipt_email: req.user.email
    });

    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      courseId: course._id,
      amount: course.price
    });
  } catch (error) {
    console.error('Stripe error:', error);
    return next(new ErrorResponse(`Payment intent creation failed: ${error.message}`, 500));
  }
});

// @desc    Create payment session for course enrollment
// @route   POST /api/v1/payments/create-checkout-session
// @access  Private
exports.createCheckoutSession = asyncHandler(async (req, res, next) => {
  const { courseId } = req.body;

  if (!courseId) {
    return next(new ErrorResponse('Please provide a course ID', 400));
  }

  const course = await Course.findById(courseId);

  if (!course) {
    return next(new ErrorResponse(`Course not found with id of ${courseId}`, 404));
  }

  // Check if the user is already enrolled
  if (course.enrolledStudents.includes(req.user.id)) {
    return next(new ErrorResponse('You are already enrolled in this course', 400));
  }

  // For free courses, enroll directly
  if (course.price <= 0) {
    // Add user to enrolledStudents
    course.enrolledStudents.push(req.user.id);
    await course.save();

    // Add course to user's enrolledCourses
    await User.findByIdAndUpdate(req.user.id, {
      $push: { enrolledCourses: course._id }
    });

    // Create initial progress record
    await Progress.create({
      user: req.user.id,
      course: course._id
    });

    return res.status(200).json({
      success: true,
      data: {
        message: 'Successfully enrolled in free course',
        course
      }
    });
  }

  try {
    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: course.title,
              description: course.description || '',
              images: course.thumbnail && course.thumbnail.url ? [course.thumbnail.url] : []
            },
            unit_amount: Math.round(course.price * 100), // Stripe needs amount in cents
          },
          quantity: 1,
        },
      ],
      metadata: {
        courseId: course._id.toString(),
        userId: req.user.id
      },
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/courses/${course._id}?success=true`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/courses/${course._id}?canceled=true`,
    });

    res.status(200).json({
      success: true,
      sessionId: session.id,
      url: session.url
    });
  } catch (error) {
    console.error('Stripe error:', error);
    return next(new ErrorResponse(`Stripe payment error: ${error.message}`, 500));
  }
});

// @desc    Stripe webhook handler
// @route   POST /api/v1/payments/webhook
// @access  Public
exports.stripeWebhook = async (req, res) => {
  const payload = req.body;
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(
      payload,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    // Handle the checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;

      // Extract metadata
      const { courseId, userId } = session.metadata;

      if (!courseId || !userId) {
        console.error('Missing metadata in webhook payload');
        return res.status(400).send('Missing required metadata');
      }

      // Create payment record
      const payment = await Payment.create({
        user: userId,
        course: courseId,
        amount: session.amount_total / 100, // Convert back from cents
        currency: session.currency,
        status: 'successful',
        paymentMethod: 'stripe',
        stripePaymentId: session.payment_intent,
        stripeCustomerId: session.customer
      });

      // Enroll the student in the course
      await Course.findByIdAndUpdate(courseId, {
        $addToSet: { enrolledStudents: userId }
      });

      // Add course to user's enrolledCourses
      await User.findByIdAndUpdate(userId, {
        $addToSet: { enrolledCourses: courseId }
      });

      // Create initial progress record
      await Progress.create({
        user: userId,
        course: courseId
      });

      console.log(`Payment successful: ${payment._id}`);
    }

    // Handle other event types as needed
    // e.g., payment_intent.succeeded, payment_intent.payment_failed, etc.

    res.status(200).json({ received: true });
  } catch (error) {
    console.error(`Webhook handler error: ${error.message}`);
    return res.status(500).send(`Webhook handler error: ${error.message}`);
  }
};

// @desc    Get payment history for current user
// @route   GET /api/v1/payments/history
// @access  Private
exports.getPaymentHistory = asyncHandler(async (req, res, next) => {
  const payments = await Payment.find({ user: req.user.id })
    .populate({
      path: 'course',
      select: 'title description thumbnail category level price'
    })
    .sort('-createdAt');

  res.status(200).json({
    success: true,
    count: payments.length,
    data: payments
  });
});

// @desc    Verify payment for a course (for manual verification)
// @route   GET /api/v1/payments/verify/:courseId
// @access  Private
exports.verifyPayment = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.courseId);

  if (!course) {
    return next(new ErrorResponse(`Course not found with id of ${req.params.courseId}`, 404));
  }

  // Check if the user is already enrolled
  const isEnrolled = course.enrolledStudents.includes(req.user.id);

  // Check if payment exists
  const payment = await Payment.findOne({
    user: req.user.id,
    course: req.params.courseId,
    status: 'successful'
  });

  res.status(200).json({
    success: true,
    data: {
      isEnrolled,
      paymentExists: !!payment,
      paymentDetails: payment
    }
  });
});

// @desc    Get course enrollment status
// @route   GET /api/v1/courses/:courseId/enrollment-status
// @access  Private
exports.getCourseEnrollmentStatus = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.courseId);

  if (!course) {
    return next(new ErrorResponse(`Course not found with id of ${req.params.courseId}`, 404));
  }

  // Check if user is enrolled
  const isEnrolled = course.enrolledStudents.includes(req.user.id);

  // Get payment for this course if enrolled
  let payment = null;
  if (isEnrolled) {
    payment = await Payment.findOne({
      user: req.user.id,
      course: req.params.courseId
    });
  }

  res.status(200).json({
    success: true,
    data: {
      isEnrolled,
      payment
    }
  });
}); 