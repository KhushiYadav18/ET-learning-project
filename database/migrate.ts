import { connectDatabase, getDatabase } from '../backend/src/config/database';
import { readFileSync } from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

async function runMigrations() {
  try {
    console.log('Starting database migration...');
    
    // Connect to database
    await connectDatabase();
    const db = await getDatabase();
    
    // Read schema file
    const schemaPath = join(__dirname, 'schema.sql');
    const schema = readFileSync(schemaPath, 'utf8');
    
    // Split schema into individual statements
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          await db.query(statement);
          console.log(`✓ Executed statement ${i + 1}/${statements.length}`);
        } catch (error) {
          console.error(`✗ Failed to execute statement ${i + 1}:`, error);
          console.error('Statement:', statement);
        }
      }
    }
    
    // Insert sample data
    await insertSampleData(db);
    
    console.log('Database migration completed successfully!');
    process.exit(0);
    
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

async function insertSampleData(db: any) {
  console.log('Inserting sample data...');
  
  try {
    // Insert sample courses
    const courseId1 = uuidv4();
    const courseId2 = uuidv4();
    
    await db.query(`
      INSERT INTO courses (id, title, description, category, difficulty_level, estimated_duration, is_published)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [courseId1, 'Introduction to Web Development', 'Learn the basics of HTML, CSS, and JavaScript', 'Programming', 'beginner', 120, true]);
    
    await db.query(`
      INSERT INTO courses (id, title, description, category, difficulty_level, estimated_duration, is_published)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [courseId2, 'Data Science Fundamentals', 'Introduction to Python, statistics, and machine learning', 'Data Science', 'intermediate', 180, true]);
    
    // Insert sample modules for course 1
    const moduleId1 = uuidv4();
    const moduleId2 = uuidv4();
    const moduleId3 = uuidv4();
    
    await db.query(`
      INSERT INTO course_modules (id, course_id, title, description, order_index, module_type, content)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [moduleId1, courseId1, 'HTML Basics', 'Learn HTML structure and elements', 1, 'text', 'HTML is the standard markup language for creating web pages...']);
    
    await db.query(`
      INSERT INTO course_modules (id, course_id, title, description, order_index, module_type, video_url, duration)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [moduleId2, courseId1, 'CSS Styling', 'Learn CSS for styling web pages', 2, 'video', 'https://example.com/css-video.mp4', 1800]);
    
    await db.query(`
      INSERT INTO course_modules (id, course_id, title, description, order_index, module_type)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [moduleId3, courseId1, 'JavaScript Quiz', 'Test your JavaScript knowledge', 3, 'quiz']);
    
    // Insert sample quiz questions
    const questionId1 = uuidv4();
    const questionId2 = uuidv4();
    
    await db.query(`
      INSERT INTO quiz_questions (id, module_id, question_text, question_type, options, correct_answer, points, order_index)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [questionId1, moduleId3, 'What is JavaScript?', 'multiple_choice', 
        JSON.stringify(['A programming language', 'A markup language', 'A styling language', 'A database']), 
        'A programming language', 1, 1]);
    
    await db.query(`
      INSERT INTO quiz_questions (id, module_id, question_text, question_type, options, correct_answer, points, order_index)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [questionId2, moduleId3, 'JavaScript is primarily used for:', 'multiple_choice', 
        JSON.stringify(['Server-side programming only', 'Client-side programming only', 'Both client and server-side', 'Database management']), 
        'Both client and server-side', 1, 2]);
    
    console.log('✓ Sample data inserted successfully');
    
  } catch (error) {
    console.error('✗ Failed to insert sample data:', error);
  }
}

// Run migrations if this file is executed directly
if (require.main === module) {
  runMigrations();
}
