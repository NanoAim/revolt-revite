import State from "../redux/State";
import { Children } from "../types/Preact";
import { BrowserRouter as Router } from "react-router-dom";

import Intermediate from './intermediate/Intermediate';
import Client from './revoltjs/RevoltClient';
import Settings from "./Settings";
import Locale from "./Locale";
import Voice from "./Voice";
import Theme from "./Theme";

export default function Context({ children }: { children: Children }) {
    return (
        <Router>
            <State>
                <Theme>
                    <Settings>
                        <Locale>
                            <Intermediate>
                                <Client>
                                    <Voice>
                                        {children}
                                    </Voice>
                                </Client>
                            </Intermediate>
                        </Locale>
                    </Settings>
                </Theme>
            </State>
        </Router>
    );
}
