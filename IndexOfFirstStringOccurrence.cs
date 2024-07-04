using System;

public class Solution {
    public int StrStr(string haystack, string needle) {
        // Edge case: If needle is an empty string, return 0 as per problem's typical expectation
        if (needle.Length == 0) {
            return 0;
        }
        
        return haystack.IndexOf(needle);
    }

    public static void Main(string[] args) {
        Solution solution = new Solution();
        
        string haystack1 = "sadbutsad";
        string needle1 = "sad";
        Console.WriteLine(solution.StrStr(haystack1, needle1)); // Output: 0
        
        string haystack2 = "leetcode";
        string needle2 = "leeto";
        Console.WriteLine(solution.StrStr(haystack2, needle2)); // Output: -1
    }
}
