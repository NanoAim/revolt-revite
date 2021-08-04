import styles from "./Panes.module.scss";
import { Text } from "preact-i18n";

import { dispatch } from "../../../redux";
import { connectState } from "../../../redux/connector";

import {
    Language,
    LanguageEntry,
    Languages as Langs,
} from "../../../context/Locale";

import Emoji from "../../../components/common/Emoji";
import Checkbox from "../../../components/ui/Checkbox";
import Tip from "../../../components/ui/Tip";
import tokiponaSVG from "../assets/toki_pona.svg";

type Props = {
    locale: Language;
};

type Key = [string, LanguageEntry];

function Entry({ entry: [x, lang], locale }: { entry: Key } & Props) {
    return (
        <Checkbox
            key={x}
            className={styles.entry}
            checked={locale === x}
            onChange={(v) => {
                if (v) {
                    dispatch({
                        type: "SET_LOCALE",
                        locale: x as Language,
                    });
                }
            }}>
            <div className={styles.flag}>
                {lang.emoji === "🙂" ? (
                    <img src={tokiponaSVG} width={42} />
                ) : (
                    <Emoji size={42} emoji={lang.emoji} />
                )}
            </div>
            <span className={styles.description}>{lang.display}</span>
        </Checkbox>
    );
}

export function Component(props: Props) {
    const languages = Object.keys(Langs).map((x) => [
        x,
        Langs[x as keyof typeof Langs],
    ]) as Key[];

    return (
        <div className={styles.languages}>
            <h3>
                <Text id="app.settings.pages.language.select" />
            </h3>
            <div className={styles.list}>
                {languages
                    .filter(([, lang]) => !lang.cat)
                    .map(([x, lang]) => (
                        <Entry key={x} entry={[x, lang]} {...props} />
                    ))}
            </div>
            <h3>
                <Text id="app.settings.pages.language.const" />
            </h3>
            <div className={styles.list}>
                {languages
                    .filter(([, lang]) => lang.cat === "const")
                    .map(([x, lang]) => (
                        <Entry key={x} entry={[x, lang]} {...props} />
                    ))}
            </div>
            <h3>
                <Text id="app.settings.pages.language.other" />
            </h3>
            <div className={styles.list}>
                {languages
                    .filter(([, lang]) => lang.cat === "alt")
                    .map(([x, lang]) => (
                        <Entry key={x} entry={[x, lang]} {...props} />
                    ))}
            </div>
            <Tip>
                <span>
                    <Text id="app.settings.tips.languages.a" />
                </span>{" "}
                <a
                    href="https://weblate.insrt.uk/engage/revolt/?utm_source=widget"
                    target="_blank"
                    rel="noreferrer">
                    <Text id="app.settings.tips.languages.b" />
                </a>
            </Tip>
        </div>
    );
}

export const Languages = connectState(Component, (state) => {
    return {
        locale: state.locale,
    };
});
