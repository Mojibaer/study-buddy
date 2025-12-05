export const STUDIENGANG = 'Software Design & Cloud Computing'

export const CATEGORIES = [
  { value: 'vorlesung', label: 'Vorlesung' },
  { value: 'uebung', label: 'Übung' },
  { value: 'pruefung', label: 'Prüfung' },
  { value: 'zusammenfassung', label: 'Zusammenfassung' },
  { value: 'skript', label: 'Skript' },
  { value: 'sonstiges', label: 'Sonstiges' },
]

export const SEMESTERS = [
  'WS25', 'SS25', 'WS24', 'SS24', 'WS23', 'SS23',
  'WS22', 'SS22', 'WS21', 'SS21', 'WS20', 'SS20',
]

// Subjects pro Semester
export const SUBJECTS_BY_SEMESTER = {
  'semester-1': {
    label: 'Semester 1',
    semesterCode: 'WS24',
    subjects: [
      { value: 'barcamp', label: 'Barcamp' },
      { value: 'datenbankdesign', label: 'Datenbankdesign' },
      { value: 'linux-grundlagen', label: 'Linux Grundlagen' },
      { value: 'mathematik-1', label: 'Mathematik für Informatik I' },
      { value: 'netzwerktechnologien', label: 'Netzwerktechnologien' },
      { value: 'rechtsgrundlagen', label: 'Rechtsgrundlagen' },
      { value: 'teamentwicklung', label: 'Teamentwicklung' },
    ],
  },
  'semester-2': {
    label: 'Semester 2',
    semesterCode: 'SS25',
    subjects: [
      { value: 'bootcamp', label: 'Bootcamp' },
      { value: 'datenstrukturen-algorithmen', label: 'Datenstrukturen und Algorithmen' },
      { value: 'hci', label: 'Human Computer Interaction' },
      { value: 'it-english', label: 'IT Industry English' },
      { value: 'linux-systemmanagement', label: 'Linux/Unix Systemmanagement' },
      { value: 'mathematik-2', label: 'Mathematik für Informatik II' },
      { value: 'netzwerkmanagement', label: 'Netzwerkmanagement' },
      { value: 'relationale-datenbanken', label: 'Relationale Datenbanken' },
      { value: 'software-development-2', label: 'Software Development II' },
      { value: 'unternehmensfuehrung', label: 'Unternehmensführung und Organisation' },
      { value: 'web-engineering', label: 'Web Engineering' },
    ],
  },
  'semester-3': {
    label: 'Semester 3',
    semesterCode: 'WS25',
    subjects: [
      { value: 'big-data', label: 'Big Data' },
      { value: 'cloud-technologien-1', label: 'Cloud Technologien 1' },
      { value: 'hackathon', label: 'Hackathon' },
      { value: 'prozess-qualitaetsmanagement', label: 'Prozess- und Qualitätsmanagement' },
      { value: 'servertechnologien', label: 'Servertechnologien' },
      { value: 'software-design', label: 'Software Design' },
      { value: 'software-quality', label: 'Software Quality' },
      { value: 'visualisierung-datamining', label: 'Visualisierung und Datamining' },
      { value: 'web-application-development', label: 'Web Application Development' },
    ],
  },
}

export const getSemesterCode = (semesterKey) => {
  return SUBJECTS_BY_SEMESTER[semesterKey]?.semesterCode || null
}

export const getAllSubjects = () => {
  return Object.values(SUBJECTS_BY_SEMESTER).flatMap((sem) => sem.subjects)
}

export const getSubjectLabel = (semesterKey, subjectValue) => {
  const semester = SUBJECTS_BY_SEMESTER[semesterKey]
  if (!semester) return subjectValue
  const subject = semester.subjects.find((s) => s.value === subjectValue)
  return subject?.label || subjectValue
}

export const getCategoryLabel = (categoryValue) => {
  const category = CATEGORIES.find((c) => c.value === categoryValue)
  return category?.label || categoryValue
}