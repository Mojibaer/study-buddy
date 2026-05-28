'use client'

import { useTranslations } from 'next-intl'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
    StructureTabs,
    useActiveStructureTab,
} from '@/components/admin/structure/StructureTabs'
import { SemestersSection } from '@/components/admin/structure/SemestersSection'
import { SubjectsSection } from '@/components/admin/structure/SubjectsSection'
import { CategoriesSection } from '@/components/admin/structure/CategoriesSection'
import { useAdminStructure } from '@/hooks/admin/useAdminStructure'

export function StructureContainer() {
    const t = useTranslations('admin.structure')
    const tab = useActiveStructureTab()
    const {
        overview,
        loading,
        error,
        refresh,
        createSemester,
        renameSemester,
        deleteSemester,
        createSubject,
        updateSubject,
        deleteSubject,
        createCategory,
        renameCategory,
        deleteCategory,
    } = useAdminStructure()

    return (
        <div className="flex flex-col gap-6">
            <StructureTabs active={tab} />

            {error && (
                <Alert variant="destructive">
                    <AlertTitle>{t('errors.loadTitle')}</AlertTitle>
                    <AlertDescription className="flex items-center gap-3">
                        <span>{error}</span>
                        <button
                            type="button"
                            onClick={() => void refresh()}
                            className="underline underline-offset-4 hover:no-underline"
                        >
                            {t('errors.retry')}
                        </button>
                    </AlertDescription>
                </Alert>
            )}

            {loading && !overview ? (
                <p className="text-muted-foreground">{t('states.loading')}</p>
            ) : overview ? (
                <>
                    {tab === 'semesters' && (
                        <SemestersSection
                            semesters={overview.semesters}
                            onCreate={createSemester}
                            onRename={renameSemester}
                            onDelete={deleteSemester}
                        />
                    )}
                    {tab === 'subjects' && (
                        <SubjectsSection
                            subjects={overview.subjects}
                            semesters={overview.semesters}
                            onCreate={createSubject}
                            onUpdate={updateSubject}
                            onDelete={deleteSubject}
                        />
                    )}
                    {tab === 'categories' && (
                        <CategoriesSection
                            categories={overview.categories}
                            onCreate={createCategory}
                            onRename={renameCategory}
                            onDelete={deleteCategory}
                        />
                    )}
                </>
            ) : null}
        </div>
    )
}