import { Signal, signal } from '@preact/signals'
import { fireproof } from 'use-fireproof'
import { connect } from '@fireproof/partykit'
import Route from 'route-event'
import Debug from '@nichoth/debug'
const debug = Debug()

type Doc = {
    _id?:string;
    count:number;
}

/**
 * Setup any state
 *   - routes
 */
export async function State ():Promise<{
    route:Signal<string>;
    count:Signal<number>;
    _db:ReturnType<typeof fireproof>
    _setRoute:(path:string)=>void;
}> {  // eslint-disable-line indent
    const onRoute = Route()
    const db = fireproof('my-app-name')

    const cx = connect.partykit(db)

    await cx.ready

    let doc:Doc
    try {
        doc = await db.get('count') as Doc
    } catch (err) {
        debug(err)
        if (String(err).includes('Getting from an empty database')) {
            console.log('empty DB')
            doc = { _id: 'count', count: 0 }
            await db.put(doc)
        } else {
            doc = { _id: 'count', count: 0 }
            await db.put(doc)
        }
    }

    const state = {
        _setRoute: onRoute.setRoute.bind(onRoute),
        _db: db,
        count: signal<number>(doc.count),
        route: signal<string>(location.pathname + location.search)
    }

    // @ts-ignore
    window.state = state

    db.subscribe((changes) => {
        const last = changes.pop()
        debug('**got an update**', last)
        if (last!._id === 'count') {
            state.count.value = last!.count as number
        }
    }, true)

    /**
     * set the app state to match the browser URL
     */
    onRoute((path:string) => {
        // for github pages
        const newPath = path.replace('/template-ts-preact-htm/', '/')
        state.route.value = newPath
    })

    return state
}

State.Increase = async function (state:Awaited<ReturnType<typeof State>>) {
    const doc = await state._db.get('count') as Doc
    await state._db.put({ _id: 'count', count: doc.count + 1 })
}

State.Decrease = async function (state:Awaited<ReturnType<typeof State>>) {
    const doc = await state._db.get('count') as Doc
    await state._db.put({ _id: 'count', count: doc.count - 1 })
}
