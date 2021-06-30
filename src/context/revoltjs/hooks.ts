import { useCallback, useContext, useEffect, useState } from "preact/hooks";
import { Channels, Servers, Users } from "revolt.js/dist/api/objects";
import { Client, PermissionCalculator } from 'revolt.js';
import { AppContext } from "./RevoltClient";

export interface HookContext {
    client: Client,
    forceUpdate: () => void
}

export function useForceUpdate(context?: HookContext): HookContext {
    const client = useContext(AppContext);
    if (context) return context;

    const H = useState(0);
    var updateState: (_: number) => void;
    if (Array.isArray(H)) {
        let [, u] = H;
        updateState = u;
    } else {
        console.warn('Failed to construct using useState.');
        updateState = ()=>{};
    }

    return { client, forceUpdate: () => updateState(Math.random()) };
}

function useObject(type: string, id?: string | string[], context?: HookContext) {
    const ctx = useForceUpdate(context);

    function update(target: any) {
        if (typeof id === 'string' ? target === id :
            Array.isArray(id) ? id.includes(target) : true) {
            ctx.forceUpdate();
        }
    }

    const map = (ctx.client as any)[type];
    useEffect(() => {
        map.addListener("update", update);
        return () => map.removeListener("update", update);
    }, [id]);

    return typeof id === 'string' ? map.get(id)
        : Array.isArray(id) ? id.map(x => map.get(x))
        : map.toArray();
}

export function useUser(id?: string, context?: HookContext) {
    if (typeof id === "undefined") return;
    return useObject('users', id, context) as Readonly<Users.User> | undefined;
}

export function useSelf(context?: HookContext) {
    const ctx = useForceUpdate(context);
    return useUser(ctx.client.user!._id, ctx);
}

export function useUsers(ids?: string[], context?: HookContext) {
    return useObject('users', ids, context) as (Readonly<Users.User> | undefined)[];
}

export function useChannel(id?: string, context?: HookContext) {
    if (typeof id === "undefined") return;
    return useObject('channels', id, context) as Readonly<Channels.Channel> | undefined;
}

export function useChannels(ids?: string[], context?: HookContext) {
    return useObject('channels', ids, context) as (Readonly<Channels.Channel> | undefined)[];
}

export function useServer(id?: string, context?: HookContext) {
    if (typeof id === "undefined") return;
    return useObject('servers', id, context) as Readonly<Servers.Server> | undefined;
}

export function useServers(ids?: string[], context?: HookContext) {
    return useObject('servers', ids, context) as (Readonly<Servers.Server> | undefined)[];
}

export function useDMs(context?: HookContext) {
    const ctx = useForceUpdate(context);

    function mutation(target: string) {
        let channel = ctx.client.channels.get(target);
        if (channel) {
            if (channel.channel_type === 'DirectMessage' || channel.channel_type === 'Group') {
                ctx.forceUpdate();
            }
        }
    }

    const map = ctx.client.channels;
    useEffect(() => {
        map.addListener("update", mutation);
        return () => map.removeListener("update", mutation);
    }, []);

    return map
        .toArray()
        .filter(x => x.channel_type === 'DirectMessage' || x.channel_type === 'Group' || x.channel_type === 'SavedMessages') as (Channels.GroupChannel | Channels.DirectMessageChannel | Channels.SavedMessagesChannel)[];
}

export function useUserPermission(id: string, context?: HookContext) {
    const ctx = useForceUpdate(context);

    const mutation = (target: string) => (target === id) && ctx.forceUpdate();
    useEffect(() => {
        ctx.client.users.addListener("update", mutation);
        return () => ctx.client.users.removeListener("update", mutation);
    }, [id]);
    
    let calculator = new PermissionCalculator(ctx.client);
    return calculator.forUser(id);
}

export function useChannelPermission(id: string, context?: HookContext) {
    const ctx = useForceUpdate(context);

    const channel = ctx.client.channels.get(id);
    const server = (channel && (channel.channel_type === 'TextChannel' || channel.channel_type === 'VoiceChannel')) ? channel.server : undefined;

    const mutation = (target: string) => (target === id) && ctx.forceUpdate();
    const mutationServer = (target: string) => (target === server) && ctx.forceUpdate();
    const mutationMember = (target: string) => (target.substr(26) === ctx.client.user!._id) && ctx.forceUpdate();

    useEffect(() => {
        ctx.client.channels.addListener("update", mutation);

        if (server) {
            ctx.client.servers.addListener("update", mutationServer);
            ctx.client.servers.members.addListener("update", mutationMember);
        }

        return () => {
            ctx.client.channels.removeListener("update", mutation);

            if (server) {
                ctx.client.servers.removeListener("update", mutationServer);
                ctx.client.servers.members.removeListener("update", mutationMember);
            }
        }
    }, [id]);
    
    let calculator = new PermissionCalculator(ctx.client);
    return calculator.forChannel(id);
}

export function useServerPermission(id: string, context?: HookContext) {
    const ctx = useForceUpdate(context);

    const mutation = (target: string) => (target === id) && ctx.forceUpdate();
    const mutationMember = (target: string) => (target.substr(26) === ctx.client.user!._id) && ctx.forceUpdate();

    useEffect(() => {
        ctx.client.servers.addListener("update", mutation);
        ctx.client.servers.members.addListener("update", mutationMember);

        return () => {
            ctx.client.servers.removeListener("update", mutation);
            ctx.client.servers.members.removeListener("update", mutationMember);
        }
    }, [id]);
    
    let calculator = new PermissionCalculator(ctx.client);
    return calculator.forServer(id);
}
