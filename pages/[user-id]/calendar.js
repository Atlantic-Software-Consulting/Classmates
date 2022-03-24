// Calendar Widget //
import Head from 'next/head';
import { useState, useEffect } from 'react';
import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import { ViewState } from '@devexpress/dx-react-scheduler';
import {
  Scheduler,
  WeekView,
  Toolbar,
  DateNavigator,
  Appointments,
  TodayButton,
  AppointmentTooltip,
} from '@devexpress/dx-react-scheduler-material-ui';


/*
getCoursesByCourseId(course_id)
getCoursesByMentorId(mentor_id)
getCoursesByMenteeId(mentee_id)
createNewCourse(body)
updateCourseInfo(course_id, body)
removeCourse(course_id)
getUserInfo(userId)
*/

import { useAuthContext } from '../../utils/context/AuthProvider';
import TooltipContent from '../../components/Calendar/subcomponents/TooltipContent.js';
import styles from '../../utils/styles/CalendarStyles/Calendar.module.css';
import { TimeTableCell, DayScaleCell } from '../../components/Calendar/Calendar.js';
import { mentorData, menteeData } from '../../components/Calendar/data/dummyData.js';
import CreateClassModal from '../../components/CreateClassModal/CreateClassModal.js'
import {
  getCoursesByMentorId,
  getCoursesByMenteeId,
  createNewCourse,
  updateCourseInfo,
  removeCourse,
  getUserInfo,
} from '../../utils/api/apiCalls.js';


//import render Calendar component

//use username from GET request, current is just mock data


export default function Calendar({ userInfo }) {
  //import user state (mentor/mentee)
  const { user } = useAuthContext();
  const [appointmentData, setAppointmentData] = useState([]);
  const [userType, setUserType] = useState(userInfo.account_type);
  const [currUserId, setCurrUserId] = useState(userInfo.id);

  const getCourseData = () => {
    console.log(userType)
    if (userType === 'Mentor') {
      getCoursesByMentorId(currUserId)
        .then(res => {
          // setAppointmentData(res);
          let apptDataResult = res.map(course => {
            return {
              title: course.name,
              startDate: new Date(course.start_date),
              endDate: new Date(course.end_date),
              zoomLink: course.meeting_url
            }
          })
          setAppointmentData(apptDataResult);
        })
        .catch(err => {
          console.log(err);
        })
    } else {
      getCoursesByMenteeId(currUserId)
        .then(res => {
          let apptDataResult = res.map(course => {
            return {
              title: course.name,
              startDate: new Date(course.start_date),
              endDate: new Date(course.end_date),
              zoomLink: course.meeting_url
            }
          })
          setAppointmentData(apptDataResult);
        })
        .catch (err => {
        console.log(err);
      })
    }
  }

  useEffect(() => {
    getUserInfo(currUserId)
      .then(res => {
        setUserType(res.account_type);
      })
  }, [])

  useEffect(() => {
    getCourseData();
}, [userType]);

  return (
    <div className="pageData">
      <div className={styles.calendarContainer}>
        <Head>
          <title>My Calendar</title>
        </Head>
        <div>
          <Paper elevation={6} className={styles.paper}>
            <Scheduler
              data={appointmentData}
              height={'800'}
            >
              <ViewState
              defaultCurrentViewName="Week"
              />
              <WeekView
                startDayHour={6}
                endDayHour={22}
                timeTableCellComponent={TimeTableCell}
                dayScaleCellComponent={DayScaleCell}
              />
              <Toolbar />
              <DateNavigator />
              <TodayButton />
              {userType === 'Mentor' &&
              <div className={styles.createClassContainer}>
                <div className={styles.createClass}>
                  <CreateClassModal getCourseData={getCourseData}/>
                </div>
              </div>
              }
              <Appointments />
              <AppointmentTooltip
              // contentComponent={TooltipContent}
              />
            </Scheduler>
          </Paper>
        </div>
      </div>
    </div>
  )
}

// export async function getServerSideProps(context) {
//   const userId = context.params['user-id'];
//   const userInfo = await getUserInfo(userId);
//   let courseData;

//   if (userInfo.account_type === 'Mentor') {
//     courseData = await getCoursesByMentorId(userInfo.id)
//   } else if (userInfo.account_type === 'Mentee') {
//     courseData = await getCoursesByMenteeId(userInfo.id)
//   }

//   return {
//     props: { userInfo, courseData, mappedApptData }
//   }
// }