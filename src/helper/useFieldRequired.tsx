import React, { createContext, useContext, useMemo } from 'react';
import { reach, AnySchema, ObjectSchema } from 'yup';

/**
 * Formik (v2) strips `validationSchema` out of its context, so a field can't
 * read its own schema to know whether it's required. Forms opt in by wrapping
 * their `<Formik>` in `<FormSchemaProvider schema={validationSchema}>`, which
 * makes `useFieldRequired(name)` resolve automatically.
 */
const FormSchemaContext = createContext<ObjectSchema<any> | undefined>(undefined);

interface FormSchemaProviderProps {
  schema?: ObjectSchema<any>;
  children: React.ReactNode;
}

export const FormSchemaProvider = ({ schema, children }: FormSchemaProviderProps) => (
  <FormSchemaContext.Provider value={schema}>{children}</FormSchemaContext.Provider>
);

/**
 * Returns `true` when the named field is marked `.required()` in the form's
 * Yup schema. Falls back to `false` when no schema is provided or the field
 * can't be reached, so callers can still pass `required` explicitly.
 */
export const useFieldRequired = (name: string): boolean => {
  const schema = useContext(FormSchemaContext);

  return useMemo(() => {
    if (!schema) {
      return false;
    }
    try {
      const fieldSchema = reach(schema, name) as AnySchema;
      return !fieldSchema.describe().optional;
    } catch {
      return false;
    }
  }, [schema, name]);
};
