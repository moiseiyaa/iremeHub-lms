'use client';
import { useParams } from 'next/navigation';
import CourseEditor from '../../../../../../components/educator/CourseEditor';
export default function EditCoursePage(){const params=useParams();const id=String(params?.id||'');return <CourseEditor courseId={id}/>;}
