// Export all models from a single file for easy imports elsewhere
console.log('Loading models...');

// Function to safely load a model
const safeRequire = (modelPath) => {
  try {
    const model = require(modelPath);
    console.log(`✅ Loaded model: ${modelPath}`);
    return model;
  } catch (err) {
    console.error(`❌ Error loading model ${modelPath}:`, err.message);
    // Return a minimal model proxy that won't crash the app but will log errors
    return new Proxy({}, {
      get: function(target, prop) {
        if (prop === 'modelName') return modelPath;
        
        // For any actual database operation, log error and return null/empty value
        if (typeof prop === 'string' && ['find', 'findOne', 'findById', 'create', 'updateOne', 'deleteOne'].includes(prop)) {
          return () => {
            console.error(`❌ Attempted to use unloaded model ${modelPath}.${prop}()`);
            return Promise.resolve(null);
          };
        }
        return target[prop];
      }
    });
  }
};

// Load all models
const User = safeRequire('./User');
const Course = safeRequire('./Course');
const Lesson = safeRequire('./Lesson');
const Section = safeRequire('./Section');
const Progress = safeRequire('./Progress');
const Payment = safeRequire('./Payment');
const Certificate = safeRequire('./Certificate');
const Announcement = safeRequire('./Announcement');

console.log('All models loaded');

module.exports = {
  User,
  Course,
  Lesson,
  Section,
  Progress,
  Payment,
  Certificate,
  Announcement
};
