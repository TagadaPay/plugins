import { cn } from '@/lib/utils';
import { PluginConfigData, Section } from '@/types/plugin-config';
import { usePluginConfig, useTranslation } from '@tagadapay/plugin-sdk/v2';
import { DynamicIcon } from './DynamicIcon';

interface SectionIconProps {
  section: Section;
  index: number;
}

/** Resolve section icon: use DynamicIcon (full icon map) or image URL */
function SectionIcon({ section, index }: SectionIconProps) {
  if (!section.useIconUrl && section.icon) {
    return (
      <div
        className="size-9 flex-shrink-0 text-[var(--ink-700)]"
        editor-id={`config.sections.items.${index}.icon`}
      >
        <DynamicIcon name={section.icon} className="size-9 flex-shrink-0 text-[var(--ink-700)]" />
      </div>
    );
  }

  const size = section.size ? `${section.size}px` : '60px';
  if (section.useIconUrl && section.iconUrl) {
    return (
      <img
        editor-id={`config.sections.items.${index}.iconUrl`}
        src={section.iconUrl}
        alt=""
        className="shrink-0 object-contain object-left"
        style={{
          width: size,
          height: size,
        }}
      />
    );
  }

  return null;
}

interface SectionsProps {
  type?: 'desktop' | 'mobile';
}

function Sections({ type = 'desktop' }: SectionsProps) {
  const { config } = usePluginConfig<PluginConfigData>();
  const { t } = useTranslation();
  const sectionsConfig = config?.sections;
  const sections = sectionsConfig?.items;

  if (!sections || sections.length === 0) {
    return null;
  }

  return (
    <div
      className={cn({
        'hidden lg:block': type === 'desktop',
        'block lg:hidden': type === 'mobile',
      })}
    >
      {sections && sections.length > 0 && (
        <div className="mt-8 flex flex-col gap-5 lg:mt-12">
          {sectionsConfig?.title && (
            <h2
              className="text-[18px] font-medium tracking-[-0.02em] text-[var(--ink-900)]"
              style={{ fontFamily: 'var(--font-display)' }}
              editor-id="config.sections.title "
            >
              {t(sectionsConfig.title)}
            </h2>
          )}
          <div
            className={cn({
              'rounded-[4px] border border-[var(--line-strong)] bg-[var(--surface)] p-6': !sectionsConfig?.noBorders,
            })}
            editor-id="config.sections.noBorders"
          >
            <div className="space-y-5">
              {sections.map((section, index) => {
                const title = t(section.titleTrans);
                const description = t(section.descriptionTrans);

                return (
                  <div
                    key={section.id || `section-${index}`}
                    className="flex items-start gap-4"
                    editor-id={`config.sections.items.${index}.useIconUrl`}
                  >
                    <SectionIcon index={index} section={section} />
                    <div className="flex-1 pt-0.5">
                      {title && (
                        <h3
                          className="text-[14px] font-medium leading-snug text-[var(--ink-900)]"
                          editor-id={`config.sections.items.${index}.titleTrans`}
                        >
                          {title}
                        </h3>
                      )}
                      {description && (
                        <p
                          className="mt-1 max-w-[54ch] text-[13px] leading-relaxed text-[var(--text-secondary-color)]"
                          editor-id={`config.sections.items.${index}.descriptionTrans`}
                        >
                          {description}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {sectionsConfig?.postText && (
            <p className="money text-[11px] uppercase tracking-[0.12em] text-[var(--ink-500)] tabular-nums" editor-id="config.sections.postText">
              {t(sectionsConfig.postText)}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default Sections;
