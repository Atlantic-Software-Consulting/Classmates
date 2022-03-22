// GET: /pages/api/courses/index.js
// POST: /pages/api/courses/index.js
import { db } from '../../../utils/api/firebase.config';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  query,
  where
} from "firebase/firestore";
import { coursePhotos } from '../../../utils/constants/index';

export default async function getAndCreateCourses(req, res) {
  const {
    query: { course_id },
    method
  } = req;

  switch (method) {
    case 'GET':
      /* getCourses */
      try {
        const querySnapshot = await getDocs(collection(db, 'courses'));
        const result = [];
        querySnapshot.forEach(doc => {
          result.push(doc.data());
        })
        res.status(200).json(result);
      } catch (err) {
        res.status(400).send(`Error retrieving classes: ${err}`);
      }

      break
    case 'POST':
      /* createNewCourse */
      const {
        capacity,
        description,
        end_date,
        endorsements,
        meeting_url,
        mentorId,
        mentorFirstName,
        mentorLastName,
        name,
        start_date,
        subject,
        type
      } = req.body;

      // look up default photo based on subject
      try {
        const docRef = await addDoc(collection(db, 'courses'), {
          name,
          "start_date": start_date,
          "end_date": end_date,
          mentees: [],
          subject,
          mentor: {
            "id": mentorId,
            "name": {
              "first_name": mentorFirstName,
              "last_name": mentorLastName
            }
          },
          capacity,
          endorsements: 0,
          description,
          "meeting_url": meeting_url,
          photo: coursePhotos[subject],
          type
        });
        res.status(200).json(`Successfully posted course`);
      } catch (err) {
        res.status(400).send(`Error posting new course: ${err}`);
      }

      break
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}