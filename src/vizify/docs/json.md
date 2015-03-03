# JSON

The included JSON library is simple, if perhaps a bit laborious, to use.

## Example

```python
import vizify.json

let obj = parseJSON("{\"foo\": 1, \"bar\": {\"a\": 1}}")

# Getting objects is straightforward
let foo = obj.get("foo").asInt()

# Nested objects, too
let a = obj.get("bar").get("a").asInt()

# Attempting to convert objects of the wrong type will raise an
# exception in the native code.
obj.get("nonexistant").asFloat() # ERROR

# Instead, you should do null checks if you aren't sure a property
# actually exists
obj.get("nonexistant").isNull() # true
```
