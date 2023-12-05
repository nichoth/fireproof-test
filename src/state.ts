import { Signal, signal } from '@preact/signals'
import { fireproof } from 'use-fireproof'
// import { Database } from 'use-fireproof'
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
    // _db:InstanceType<typeof Database>
    _db:ReturnType<typeof fireproof>
    _setRoute:(path:string)=>void;
}> {  // eslint-disable-line indent
    const onRoute = Route()

    const db = fireproof('my-app-name')
    // const db = new Database('my-app-name')

    const unsub = db.subscribe((changes) => {
        // updates is an array of documents
        debug('**got an update**', changes)
    })

    // get a document
    let doc:Doc
    try {
        doc = await db.get('count') as Doc
    } catch (err) {
        debug('**errrrr**', err)
        doc = { _id: 'count', count: 0 }
        await db.put(doc)
    }

    const state = {
        _setRoute: onRoute.setRoute.bind(onRoute),
        _db: db,
        count: signal<number>(doc.count),
        route: signal<string>(location.pathname + location.search)
    }

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
    state.count.value++
}

State.Decrease = async function (state:Awaited<ReturnType<typeof State>>) {
    const doc = await state._db.get('count') as Doc
    await state._db.put({ _id: 'count', count: doc.count - 1 })
    state.count.value--
}
