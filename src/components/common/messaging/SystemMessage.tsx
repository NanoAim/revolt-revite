import {
    InfoCircle,
    UserPlus,
    UserMinus,
    ArrowToRight,
    ArrowToLeft,
    UserX,
    ShieldX,
    EditAlt,
    Edit,
    MessageSquareEdit,
} from "@styled-icons/boxicons-solid";
import { observer } from "mobx-react-lite";
import { Message } from "revolt.js/dist/maps/Messages";
import { User } from "revolt.js/dist/maps/Users";
import styled from "styled-components";

import { attachContextMenu } from "preact-context-menu";

import { TextReact } from "../../../lib/i18n";

import { useClient } from "../../../context/revoltjs/RevoltClient";

import UserShort from "../user/UserShort";
import MessageBase, { MessageDetail, MessageInfo } from "./MessageBase";

const SystemContent = styled.div`
    gap: 4px;
    display: flex;
    padding: 2px 0;
    flex-wrap: wrap;
    align-items: center;
    flex-direction: row;
`;

type SystemMessageParsed =
    | { type: "text"; content: string }
    | { type: "user_added"; user: User; by: User }
    | { type: "user_remove"; user: User; by: User }
    | { type: "user_joined"; user: User }
    | { type: "user_left"; user: User }
    | { type: "user_kicked"; user: User }
    | { type: "user_banned"; user: User }
    | { type: "channel_renamed"; name: string; by: User }
    | { type: "channel_description_changed"; by: User }
    | { type: "channel_icon_changed"; by: User };

interface Props {
    attachContext?: boolean;
    message: Message;
    highlight?: boolean;
    hideInfo?: boolean;
}

const iconDictionary = {
    user_added: UserPlus,
    user_remove: UserMinus,
    user_joined: ArrowToRight,
    user_left: ArrowToLeft,
    user_kicked: UserX,
    user_banned: ShieldX,
    channel_renamed: EditAlt,
    channel_description_changed: Edit,
    channel_icon_changed: MessageSquareEdit,
    text: InfoCircle,
};

export const SystemMessage = observer(
    ({ attachContext, message, highlight, hideInfo }: Props) => {
        const client = useClient();

        let data: SystemMessageParsed;
        const content = message.content;
        if (typeof content === "object") {
            switch (content.type) {
                case "text":
                    data = content;
                    break;
                case "user_added":
                case "user_remove":
                    data = {
                        type: content.type,
                        user: client.users.get(content.id)!,
                        by: client.users.get(content.by)!,
                    };
                    break;
                case "user_joined":
                case "user_left":
                case "user_kicked":
                case "user_banned":
                    data = {
                        type: content.type,
                        user: client.users.get(content.id)!,
                    };
                    break;
                case "channel_renamed":
                    data = {
                        type: "channel_renamed",
                        name: content.name,
                        by: client.users.get(content.by)!,
                    };
                    break;
                case "channel_description_changed":
                case "channel_icon_changed":
                    data = {
                        type: content.type,
                        by: client.users.get(content.by)!,
                    };
                    break;
                default:
                    data = { type: "text", content: JSON.stringify(content) };
            }
        } else {
            data = { type: "text", content };
        }

        const SystemMessageIcon = iconDictionary[data.type] ?? InfoCircle;

        const SystemIcon = styled(SystemMessageIcon)`
            height: 1.33em;
            width: 1.33em;
            margin-right: 0.5em;
            color: var(--tertiary-foreground);
        `;

        let children;
        switch (data.type) {
            case "text":
                children = <span>{data.content}</span>;
                break;
            case "user_added":
            case "user_remove":
                children = (
                    <TextReact
                        id={`app.main.channel.system.${
                            data.type === "user_added"
                                ? "added_by"
                                : "removed_by"
                        }`}
                        fields={{
                            user: <UserShort user={data.user} />,
                            other_user: <UserShort user={data.by} />,
                        }}
                    />
                );
                break;
            case "user_joined":
            case "user_left":
            case "user_kicked":
            case "user_banned":
                children = (
                    <TextReact
                        id={`app.main.channel.system.${data.type}`}
                        fields={{
                            user: <UserShort user={data.user} />,
                        }}
                    />
                );
                break;
            case "channel_renamed":
                children = (
                    <TextReact
                        id={`app.main.channel.system.channel_renamed`}
                        fields={{
                            user: <UserShort user={data.by} />,
                            name: <b>{data.name}</b>,
                        }}
                    />
                );
                break;
            case "channel_description_changed":
            case "channel_icon_changed":
                children = (
                    <TextReact
                        id={`app.main.channel.system.${data.type}`}
                        fields={{
                            user: <UserShort user={data.by} />,
                        }}
                    />
                );
                break;
        }

        return (
            <MessageBase
                highlight={highlight}
                onContextMenu={
                    attachContext
                        ? attachContextMenu("Menu", {
                              message,
                              contextualChannel: message.channel,
                          })
                        : undefined
                }>
                {!hideInfo && (
                    <MessageInfo>
                        <MessageDetail message={message} position="left" />
                        <SystemIcon className="system-message-icon" />
                    </MessageInfo>
                )}
                <SystemContent>{children}</SystemContent>
            </MessageBase>
        );
    },
);
