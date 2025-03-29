// Enumeración para las secciones del formulario
export enum FormSection {
    PERSONAL = 'personal',
    PROFESSIONAL = 'professional', 
    ADDITIONAL = 'additional'
  }
  
  // Tipos de campos para el formulario
  export enum FieldType {
    TEXT = 'text',
    DATE = 'date',
    SELECT = 'select',
    MULTISELECT = 'multiselect',
    CHECKBOX = 'checkbox',
    PHONE = 'phone',
    NUMBER = 'number',
    PASSWORD = 'password' // Añadido para campos de contraseña
  }
  
  // Opciones para campos de selección
  export interface SelectOption {
    value: string;
    label: string;
  }
  
  // Interfaz principal para datos del formulario
  export interface UserFormData {
    // Sección Personal
    nacimiento: string; // Fecha en formato ISO
    ciudad: string;
    estado: string;
    cp: string;
    cd_profesional: string;
    telefono: string;
    nueva_contrasena: string; // Nuevo campo para cambiar contraseña
    confirmar_contrasena: string; // Nuevo campo para confirmar la contraseña
    
    // Sección Profesional
    tiempo_residente: string;
    tiempo_psiquatria: string;
    no_psiquiatra: string;
    especialidades: string[]; // Multi-selección
    tiempo_especialidad: string;
    otro_estudio: string;
    
    // Sección Adicional
    conocer_mcnp: string[]; // Multi-selección
    alimento: string;
    reto_sedentarismo: string; // Cambiado a string (selección única)
    actividad_tanque_tapas: string;
    alergia: string;
    seguro_salud: string;
    tipo_sangre: string;
    contacto_nombre: string;
    contacto_telefono: string;
    
    // Términos y condiciones
    check_personal: string; // Cambiado a string para guardar "1"
    check_publicacion: string; // Cambiado a string para guardar "1"
  }
  
  // Interfaz para un formulario parcialmente completo
  export type PartialUserFormData = Partial<UserFormData>;
  
  // Interfaz para el progreso del formulario
  export interface FormProgress {
    currentSection: FormSection;
    completedSections: FormSection[];
    savedFields: string[];
  }
  
  // Definición de campos por sección (útil para validación y renderizado)
  export const FORM_FIELDS = {
    [FormSection.PERSONAL]: [
      'nacimiento', 'ciudad', 'estado', 'cp', 
      'cd_profesional', 'telefono', 'nueva_contrasena', 'confirmar_contrasena'
    ],
    [FormSection.PROFESSIONAL]: [
      'tiempo_residente', 'tiempo_psiquatria', 'no_psiquiatra',
      'especialidades', 'tiempo_especialidad', 'otro_estudio'
    ],
    [FormSection.ADDITIONAL]: [
      'conocer_mcnp', 'alimento', 'reto_sedentarismo', 'actividad_tanque_tapas', 
      'alergia', 'seguro_salud', 'tipo_sangre', 'contacto_nombre',
      'contacto_telefono', 'check_personal', 'check_publicacion'
    ]
  };
  
  // Campos requeridos (todos excepto no_psiquiatra, otro_estudio, alergia)
  export const REQUIRED_FIELDS = [
    'nacimiento', 'ciudad', 'estado', 'cp', 'cd_profesional', 'telefono',
    'tiempo_residente', 'tiempo_psiquatria', 'especialidades', 'tiempo_especialidad',
    'conocer_mcnp', 'alimento', 'reto_sedentarismo', 'actividad_tanque_tapas',
    'seguro_salud', 'tipo_sangre', 'contacto_nombre', 'contacto_telefono',
    'check_personal', 'check_publicacion'
  ];
  
  // Opciones para campos de selección
  export const FIELD_OPTIONS = {
    tiempo_residente: [
      { value: 'R1', label: 'R1' },
      { value: 'R2', label: 'R2' },
      { value: 'R3', label: 'R3' },
      { value: 'R4', label: 'R4' },
      { value: 'R5', label: 'R5' },
      { value: 'R6 o mayor', label: 'R6 o mayor' },
      { value: 'No aplica', label: 'No aplica' }
    ],
    tiempo_psiquatria: [
      { value: '< 5 años', label: 'Menos de 5 años' },
      { value: '5-15 años', label: 'Entre 5 y 15 años' },
      { value: '16-25 años', label: 'Entre 16 y 25 años' },
      { value: '> 25 años', label: 'Más de 25 años' },
      { value: 'No aplica', label: 'No aplica' }
    ],
    especialidades: [
      { value: 'adicciones', label: 'Adicciones' },
      { value: 'medicina_sueno', label: 'Medicina del sueño' },
      { value: 'neuropsiquiatria', label: 'Neuropsiquiatría' },
      { value: 'paidopsiquitria', label: 'Paidopsiquitría' },
      { value: 'psiquiatria_enlace', label: 'Psiquiatria de enlace' },
      { value: 'psicogeriatria', label: 'Psicogeriatría' },
      { value: 'otro', label: 'Otro' },
      { value: 'sin_especialidad', label: 'No tengo especialidad' }
    ],
    tiempo_especialidad: [
      { value: '< 5 años', label: 'Menos de 5 años' },
      { value: '5-15 años', label: 'Entre 5 y 15 años' },
      { value: '16-25 años', label: 'Entre 16 y 25 años' },
      { value: '> 25 años', label: 'Más de 25 años' },
      { value: 'No aplica', label: 'No aplica' }
    ],
    conocer_mcnp: [
      { value: 'correo_electronico', label: 'Correo electrónico' },
      { value: 'evento_academico', label: 'Evento académico' },
      { value: 'facebook', label: 'Facebook' },
      { value: 'instagram', label: 'Instagram' },
      { value: 'tiktok', label: 'Tiktok' },
      { value: 'x', label: 'X' },
      { value: 'linkedin', label: 'LinkedIn' },
      { value: 'sitio_web', label: 'Sitio web de MCNP' },
      { value: 'google', label: 'Google' },
      { value: 'recomendacion_profesor', label: 'Recomendación de un profesor o exprofesor' },
      { value: 'recomendacion_colega', label: 'Recomendación de un colega' }
    ],
    alimento: [
      { value: 'Regular', label: 'Regular' },
      { value: 'Vegetariano', label: 'Vegetariano' }
    ],
    reto_sedentarismo: [
      { value: 'rally', label: 'Rally' },
      { value: 'actividad_acuatica', label: 'Actividad Acuática' },
      { value: 'yoga', label: 'Yoga' },
      { value: 'no_asistire', label: 'No asistiré' }
    ],
    actividad_tanque_tapas: [
      { value: 'Asistire', label: 'Asistiré' },
      { value: 'No asistire', label: 'No asistiré' }
    ],
    seguro_salud: [
      { value: 'IMSS', label: 'IMSS' },
      { value: 'póliza privada', label: 'póliza privada' },
      { value: 'Ninguno', label: 'Ninguno' },
      { value: 'Otro', label: 'Otro' }
    ],
    tipo_sangre: [
      { value: 'O+', label: 'O+' },
      { value: 'O-', label: 'O-' },
      { value: 'A+', label: 'A+' },
      { value: 'A-', label: 'A-' },
      { value: 'B+', label: 'B+' },
      { value: 'B-', label: 'B-' },
      { value: 'AB+', label: 'AB+' },
      { value: 'AB-', label: 'AB-' }
    ]
  };