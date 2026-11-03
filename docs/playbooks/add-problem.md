# Add interview problems

A problem is a reference to a reputable problem bank plus original hints. It
appears in its lessons' interview section, the practice tracker and mock
interviews. Problems never contain statements, editorials or solutions.

## Steps

1. Choose problems that apply an idea the linked lesson teaches. Take them
   from a registered problem bank (`kind: problem-bank`, LeetCode today), and
   prefer problems on registered curated lists.
2. Scaffold with the bank's own slug, title and difficulty:

   ```sh
   pnpm new:problem two-sum --title "Two Sum" --url https://leetcode.com/problems/two-sum/ --difficulty easy --lesson dsa/hash-maps
   ```

3. Set `lessons` to every lesson that teaches a needed idea, and `topics` to
   kebab-case tags.
4. Add `lists` only after checking membership in the list's published data:
   - Blind 75 and NeetCode 150: the `blind75` and `neetcode150` flags in
     NeetCode's
     [`.problemSiteData.json`](https://raw.githubusercontent.com/neetcode-gh/leetcode/main/.problemSiteData.json).
     The `link` field there is the LeetCode slug.
   - For any other list, register it first ([add-source.md](add-source.md)) and
     record where you checked membership in your change description.

   LeetCode blocks automated clients, so take slugs from list data rather than
   guessing them. Leave `lists` empty if you cannot verify membership.

5. Write 2–3 original hints that escalate from the key observation to the
   approach and its complexity. Do not include code.
6. Run `pnpm lint && pnpm build`.

## Done when

- [ ] The URL starts with a registered prefix, and the title and difficulty
      match the source.
- [ ] Every listed membership was checked against published list data.
- [ ] Hints are original, contain no code, and agree with the linked lesson.
