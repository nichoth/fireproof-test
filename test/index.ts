import { test } from '@nichoth/tapzero'
import { fireproof } from 'use-fireproof'

test('subscribe', async t => {
    const db = fireproof('testing')
    t.plan(2)

    const unsub = db.subscribe((changes) => {
        unsub()
        t.ok(changes, 'should get changes')
        t.ok(changes.length, 'changes is not empty')
    })

    await db.put({ _id: 'count', count: 1 })
})
